"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Calendar,
  Megaphone,
  UserCog,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationData } from "@/lib/actions/notification-actions";
import { NotificationType } from "@prisma/client";

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onClose?: () => void;
}

const typeIcons: Record<NotificationType, typeof Bell> = {
  REGISTRATION_SUBMITTED: UserPlus,
  REGISTRATION_APPROVED: CheckCircle,
  REGISTRATION_REJECTED: XCircle,
  EVENT_CREATED: Calendar,
  EVENT_UPDATED: Calendar,
  ANNOUNCEMENT_PUBLISHED: Megaphone,
  USER_ROLE_CHANGED: UserCog,
};

const typeColors: Record<NotificationType, string> = {
  REGISTRATION_SUBMITTED: "text-blue-500",
  REGISTRATION_APPROVED: "text-green-500",
  REGISTRATION_REJECTED: "text-red-500",
  EVENT_CREATED: "text-purple-500",
  EVENT_UPDATED: "text-purple-500",
  ANNOUNCEMENT_PUBLISHED: "text-orange-500",
  USER_ROLE_CHANGED: "text-yellow-500",
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClose,
}: NotificationItemProps) {
  const router = useRouter();
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;

  const Icon = typeIcons[notification.type] || Bell;
  const iconColor = typeColors[notification.type] || "text-muted-foreground";

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose?.();
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: dateLocale,
  });

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-accent/50",
        !notification.read && "bg-accent/30"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex-shrink-0 rounded-full p-2 bg-muted",
          iconColor
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm line-clamp-1",
            !notification.read && "font-medium"
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>
      {!notification.read && (
        <div className="flex-shrink-0 mt-1.5">
          <span className="h-2 w-2 rounded-full bg-primary block" />
        </div>
      )}
    </button>
  );
}
