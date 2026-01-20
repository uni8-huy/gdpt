"use client";

import { createContext, useContext, ReactNode } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notification-actions";
import type { NotificationData } from "@/lib/actions/notification-actions";

type NotificationContextType = {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reconnect: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
  userId: string;
}

export function NotificationProvider({ children, userId }: NotificationProviderProps) {
  const {
    notifications,
    unreadCount,
    isConnected,
    error,
    markAsRead: optimisticMarkAsRead,
    markAllAsRead: optimisticMarkAllAsRead,
    reconnect,
  } = useNotifications();

  const markAsRead = async (notificationId: string) => {
    // Optimistic update
    optimisticMarkAsRead(notificationId);
    // Server update
    await markNotificationRead(notificationId, userId);
  };

  const markAllAsRead = async () => {
    // Optimistic update
    optimisticMarkAllAsRead();
    // Server update
    await markAllNotificationsRead(userId);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        error,
        markAsRead,
        markAllAsRead,
        reconnect,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
}
