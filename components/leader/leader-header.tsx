"use client";

import { NotificationProvider, NotificationBell } from "@/components/notifications";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { LogoutButton } from "@/components/auth/logout-button";

interface LeaderHeaderProps {
  appName: string;
  userName: string;
  roleLabel: string;
  userId: string;
  logoutLabel?: string;
}

// Mobile header component for Leader portal
export function LeaderMobileHeader({ appName, userId, logoutLabel }: Pick<LeaderHeaderProps, "appName" | "userId" | "logoutLabel">) {
  return (
    <NotificationProvider userId={userId}>
      <header className="md:hidden border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{appName}</h1>
          <div className="flex items-center gap-2">
            <NotificationBell notificationsPageUrl="/leader/notifications" />
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

// Desktop sidebar header component for Leader portal
export function LeaderDesktopHeader({ appName, userName, roleLabel, userId }: LeaderHeaderProps) {
  return (
    <NotificationProvider userId={userId}>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{appName}</h1>
          <div className="flex items-center gap-2">
            <NotificationBell notificationsPageUrl="/leader/notifications" />
            <LanguageSwitcher />
          </div>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">{userName}</p>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
      </div>
    </NotificationProvider>
  );
}

// Legacy export for backward compatibility
export function LeaderHeader({ appName, userName, roleLabel, userId }: LeaderHeaderProps) {
  return <LeaderDesktopHeader appName={appName} userName={userName} roleLabel={roleLabel} userId={userId} />;
}
