"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Role } from "@prisma/client";
import { cancelInvitation, resendInvitation } from "@/lib/actions/invitation-actions";

type Invitation = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  unit: { name: string } | null;
};

interface InvitationsTabProps {
  invitations: Invitation[];
  currentUserId: string;
  translations: {
    email: string;
    role: string;
    unit: string;
    expires: string;
    expired: string;
    days: string;
    pending: string;
    used: string;
    cancel: string;
    resend: string;
    copyLink: string;
    linkCopied: string;
    noInvitations: string;
    common: {
      cancel: string;
      delete: string;
      deleting: string;
    };
    roles: {
      admin: string;
      leader: string;
      parent: string;
    };
  };
}

export function InvitationsTab({ invitations, currentUserId, translations: t }: InvitationsTabProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = async (token: string, id: string) => {
    const baseUrl = window.location.origin;
    const locale = window.location.pathname.split("/")[1];
    const link = `${baseUrl}/${locale}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancel = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      await cancelInvitation(deleteId);
      router.refresh();
    } catch (error) {
      console.error("Failed to cancel invitation:", error);
    } finally {
      setIsLoading(false);
      setDeleteId(null);
    }
  };

  const handleResend = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await resendInvitation(id, currentUserId);
      // Copy new link to clipboard
      const baseUrl = window.location.origin;
      const locale = window.location.pathname.split("/")[1];
      const link = `${baseUrl}/${locale}/invite/${result.token}`;
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      router.refresh();
    } catch (error) {
      console.error("Failed to resend invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: Role) => {
    return t.roles[role.toLowerCase() as keyof typeof t.roles];
  };

  const getExpiryStatus = (expiresAt: Date, usedAt: Date | null) => {
    if (usedAt) {
      return { label: t.used, variant: "secondary" as const };
    }
    const now = new Date();
    const expiry = new Date(expiresAt);
    if (expiry < now) {
      return { label: t.expired, variant: "destructive" as const };
    }
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { label: `${daysLeft} ${t.days}`, variant: "default" as const };
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t.noInvitations}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.email}</TableHead>
              <TableHead>{t.role}</TableHead>
              <TableHead>{t.unit}</TableHead>
              <TableHead>{t.expires}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const status = getExpiryStatus(invitation.expiresAt, invitation.usedAt);
              const isExpired = status.variant === "destructive";
              const isUsed = invitation.usedAt !== null;

              return (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      {invitation.name && (
                        <div className="text-sm text-muted-foreground">{invitation.name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleLabel(invitation.role)}</Badge>
                  </TableCell>
                  <TableCell>{invitation.unit?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!isUsed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(invitation.token, invitation.id)}
                          title={t.copyLink}
                        >
                          {copiedId === invitation.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {(isExpired || isUsed) && !isUsed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResend(invitation.id)}
                          disabled={isLoading}
                          title={t.resend}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      {!isUsed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(invitation.id)}
                          className="text-destructive hover:text-destructive"
                          title={t.cancel}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.cancel}?</AlertDialogTitle>
            <AlertDialogDescription>
              This invitation will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? t.common.deleting : t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
