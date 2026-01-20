import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Poll interval in milliseconds
const POLL_INTERVAL = 5000;

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const encoder = new TextEncoder();
  let isActive = true;

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE message
      const sendEvent = (data: unknown) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Initial data fetch
      const [notifications, unreadCount] = await Promise.all([
        db.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            data: true,
            read: true,
            readAt: true,
            actionUrl: true,
            createdAt: true,
          },
        }),
        db.notification.count({
          where: { userId, read: false },
        }),
      ]);

      sendEvent({ type: "init", notifications, unreadCount });

      // Keep polling for updates
      let lastCheck = new Date();

      const poll = async () => {
        if (!isActive) return;

        try {
          // Check for new notifications since last check
          const [newNotifications, newUnreadCount] = await Promise.all([
            db.notification.findMany({
              where: {
                userId,
                createdAt: { gt: lastCheck },
              },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                type: true,
                title: true,
                message: true,
                data: true,
                read: true,
                readAt: true,
                actionUrl: true,
                createdAt: true,
              },
            }),
            db.notification.count({
              where: { userId, read: false },
            }),
          ]);

          if (newNotifications.length > 0) {
            sendEvent({ type: "new", notifications: newNotifications, unreadCount: newUnreadCount });
          } else {
            // Send heartbeat with current unread count
            sendEvent({ type: "heartbeat", unreadCount: newUnreadCount });
          }

          lastCheck = new Date();
        } catch {
          // Silently handle errors (connection might be closed)
        }

        if (isActive) {
          setTimeout(poll, POLL_INTERVAL);
        }
      };

      // Start polling after initial delay
      setTimeout(poll, POLL_INTERVAL);
    },
    cancel() {
      isActive = false;
    },
  });

  // Handle client disconnect
  request.signal.addEventListener("abort", () => {
    isActive = false;
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
