"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@prisma/client";
import { createInvitation } from "@/lib/actions/invitation-actions";

interface InviteDialogProps {
  currentUserId: string;
  units: { id: string; name: string }[];
  defaultRole?: Role;
  translations: {
    invite: string;
    create: string;
    email: string;
    name: string;
    role: string;
    unit: string;
    selectUnit: string;
    optional: string;
    createSuccess: string;
    shareLink: string;
    expiresIn7Days: string;
    inviteDetails: string;
    copyLink: string;
    linkCopied: string;
    common: {
      cancel: string;
      tryAgain: string;
    };
    roles: {
      admin: string;
      leader: string;
      parent: string;
    };
  };
}

export function InviteDialog({ currentUserId, units, defaultRole, translations: t }: InviteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState<string>("");
  const [inviteDetails, setInviteDetails] = useState<{
    email: string;
    role: Role;
    unitName?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: (defaultRole || "LEADER") as Role,
    unitId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createInvitation({
        email: formData.email,
        name: formData.name || undefined,
        role: formData.role,
        unitId: formData.unitId || undefined,
        createdBy: currentUserId,
      });

      const baseUrl = window.location.origin;
      const locale = window.location.pathname.split("/")[1];
      const link = `${baseUrl}/${locale}/invite/${result.token}`;
      setInviteLink(link);
      setInviteDetails({
        email: formData.email,
        role: formData.role,
        unitName: result.invitation.unit?.name,
      });
      setStep("success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setStep("form");
      setFormData({ email: "", name: "", role: defaultRole || "LEADER", unitId: "" });
      setError(null);
      setInviteLink("");
      setInviteDetails(null);
    }
  };

  const getRoleLabel = (role: Role) => {
    return t.roles[role.toLowerCase() as keyof typeof t.roles];
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t.invite}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>{t.create}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t.email} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t.role} *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as Role })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEADER">{t.roles.leader}</SelectItem>
                    <SelectItem value="PARENT">{t.roles.parent}</SelectItem>
                    <SelectItem value="ADMIN">{t.roles.admin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "LEADER" && (
                <div className="space-y-2">
                  <Label htmlFor="unit">{t.unit} ({t.optional})</Label>
                  <Select
                    value={formData.unitId}
                    onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectUnit} />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t.name} ({t.optional})</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {t.create}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t.createSuccess}</DialogTitle>
              <DialogDescription>{t.shareLink}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="font-mono text-sm" />
                <Button onClick={copyToClipboard} variant="outline" size="icon">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">⚠️ {t.expiresIn7Days}</p>

              {inviteDetails && (
                <div className="border rounded-lg p-3 space-y-1 text-sm">
                  <h4 className="font-medium">{t.inviteDetails}</h4>
                  <p>{t.email}: {inviteDetails.email}</p>
                  <p>{t.role}: {getRoleLabel(inviteDetails.role)}</p>
                  {inviteDetails.unitName && <p>{t.unit}: {inviteDetails.unitName}</p>}
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => handleOpenChange(false)}>Done</Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
