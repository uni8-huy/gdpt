"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { NotificationType, Role, Prisma } from "@prisma/client";

export type NotificationData = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Prisma.JsonValue | null;
  read: boolean;
  readAt: Date | null;
  actionUrl: string | null;
  createdAt: Date;
};

// Create a notification for a single user
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Prisma.InputJsonValue,
  actionUrl?: string
) {
  const notification = await db.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ?? Prisma.JsonNull,
      actionUrl,
    },
  });

  return notification;
}

// Create notifications for multiple users (batch)
export async function createNotificationsForUsers(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  data?: Prisma.InputJsonValue,
  actionUrl?: string
) {
  if (userIds.length === 0) return [];

  const notifications = await db.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      data: data ?? Prisma.JsonNull,
      actionUrl,
    })),
  });

  return notifications;
}

// Create notifications for all users with specific roles
export async function createNotificationsForRoles(
  roles: Role[],
  type: NotificationType,
  title: string,
  message: string,
  data?: Prisma.InputJsonValue,
  actionUrl?: string
) {
  const users = await db.user.findMany({
    where: { role: { in: roles } },
    select: { id: true },
  });

  const userIds = users.map((u) => u.id);
  return createNotificationsForUsers(userIds, type, title, message, data, actionUrl);
}

// Get notifications for a user
export async function getNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<NotificationData[]> {
  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
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
  });

  return notifications;
}

// Get unread count for a user
export async function getUnreadCount(userId: string): Promise<number> {
  return db.notification.count({
    where: { userId, read: false },
  });
}

// Mark a single notification as read
export async function markNotificationRead(notificationId: string, userId: string) {
  const notification = await db.notification.update({
    where: { id: notificationId, userId },
    data: { read: true, readAt: new Date() },
  });

  return notification;
}

// Mark all notifications as read for a user
export async function markAllNotificationsRead(userId: string) {
  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });

  revalidatePath("/");
  return { success: true };
}

// Get notifications with unread count (for initial load)
export async function getNotificationsWithCount(
  userId: string,
  limit: number = 5
): Promise<{ notifications: NotificationData[]; unreadCount: number }> {
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(userId, limit),
    getUnreadCount(userId),
  ]);

  return { notifications, unreadCount };
}
