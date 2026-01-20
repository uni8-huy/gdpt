"use client";

import { NotificationProvider, NotificationBell } from "@/components/notifications";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { LogoutButton } from "@/components/auth/logout-button";

interface AdminHeaderProps {
  appName: string;
  userEmail: string;
  userId: string;
  logoutLabel?: string;
}

// Mobile header component for Admin portal
export function AdminMobileHeader({ appName, userId, logoutLabel }: Pick<AdminHeaderProps, "appName" | "userId" | "logoutLabel">) {
  return (
    <NotificationProvider userId={userId}>
      <header className="md:hidden border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{appName}</h1>
          <div className="flex items-center gap-2">
            <NotificationBell notificationsPageUrl="/admin/notifications" />
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

// Desktop sidebar header component for Admin portal
export function AdminDesktopHeader({ appName, userEmail, userId }: AdminHeaderProps) {
  return (
    <NotificationProvider userId={userId}>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{appName}</h1>
          <div className="flex items-center gap-2">
            <NotificationBell notificationsPageUrl="/admin/notifications" />
            <LanguageSwitcher />
          </div>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">{userEmail}</p>
      </div>
    </NotificationProvider>
  );
}

// Legacy export for backward compatibility
export function AdminHeader({ appName, userEmail, userId }: AdminHeaderProps) {
  return <AdminDesktopHeader appName={appName} userEmail={userEmail} userId={userId} />;
}
