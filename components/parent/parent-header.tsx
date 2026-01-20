"use client";

import { NotificationProvider, NotificationBell } from "@/components/notifications";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { LogoutButton } from "@/components/auth/logout-button";

interface ParentHeaderProps {
  appName: string;
  userName: string;
  roleLabel: string;
  userId: string;
  logoutLabel: string;
}

// Mobile header component
export function ParentMobileHeader({ appName, userId, logoutLabel }: Pick<ParentHeaderProps, "appName" | "userId" | "logoutLabel">) {
  return (
    <NotificationProvider userId={userId}>
      <header className="md:hidden border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{appName}</h1>
          <div className="flex items-center gap-2">
            <NotificationBell notificationsPageUrl="/parent/announcements" />
            <LanguageSwitcher />
            <LogoutButton
              label=""
              variant="ghost"
              showIcon={true}
              className="text-destructive p-2"
            />
          </div>
        </div>
      </header>
    </NotificationProvider>
  );
}

// Desktop sidebar header component
export function ParentDesktopHeader({ appName, userName, roleLabel, userId, logoutLabel }: ParentHeaderProps) {
  return (
    <NotificationProvider userId={userId}>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{appName}</h1>
          <div className="flex items-center gap-2">
            <NotificationBell notificationsPageUrl="/parent/announcements" />
            <LanguageSwitcher />
          </div>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">{userName}</p>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
      </div>
    </NotificationProvider>
  );
}
