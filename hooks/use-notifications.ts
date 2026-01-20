"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { NotificationData } from "@/lib/actions/notification-actions";

type SSEMessage =
  | { type: "init"; notifications: NotificationData[]; unreadCount: number }
  | { type: "new"; notifications: NotificationData[]; unreadCount: number }
  | { type: "heartbeat"; unreadCount: number };

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource("/api/notifications/stream");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSEMessage;

          if (data.type === "init") {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
          } else if (data.type === "new") {
            // Prepend new notifications
            setNotifications((prev) => {
              const newIds = new Set(data.notifications.map((n) => n.id));
              const filtered = prev.filter((n) => !newIds.has(n.id));
              return [...data.notifications, ...filtered].slice(0, 20);
            });
            setUnreadCount(data.unreadCount);
          } else if (data.type === "heartbeat") {
            setUnreadCount(data.unreadCount);
          }
        } catch {
          // Ignore parse errors
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();

        // Exponential backoff reconnect
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          if (reconnectAttempts.current < 10) {
            connect();
          } else {
            setError("Connection failed. Please refresh the page.");
          }
        }, delay);
      };
    } catch {
      setError("Failed to connect to notification stream");
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Mark notification as read (optimistic update)
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, read: true, readAt: new Date() }
          : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read (optimistic update)
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date() }))
    );
    setUnreadCount(0);
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    notifications,
    unreadCount,
    isConnected,
    error,
    markAsRead,
    markAllAsRead,
    reconnect: connect,
  };
}
