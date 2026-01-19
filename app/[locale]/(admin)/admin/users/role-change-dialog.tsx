"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Role } from "@prisma/client";
import { updateUserRole } from "@/lib/actions/user-actions";

type Unit = { id: string; name: string };

interface RoleChangeDialogProps {
  user: {
    id: string;
    name: string;
    role: Role;
    leaderProfile: { id: string } | null;
    parentLinks: { student: { id: string } }[];
  } | null;
  currentUserId: string;
  units?: Unit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
    title: string;
    description: string;
    currentRole: string;
    newRole: string;
    selectRole: string;
    warnings: string;
    fromLeaderWarning: string;
    fromParentWarning: string;
    toAdminWarning: string;
    toLeaderPrompt: string;
    selectUnit: string;
    optional: string;
    confirm: string;
    confirming: string;
    success: string;
    lastAdminWarning: string;
    cannotChangeSelf: string;
    roles: {
      admin: string;
      leader: string;
      parent: string;
    };
    common: {
      cancel: string;
      tryAgain: string;
    };
  };
}

const roleColors: Record<Role, "destructive" | "default" | "secondary"> = {
  ADMIN: "destructive",
  LEADER: "default",
  PARENT: "secondary",
};

export function RoleChangeDialog({
  user,
  currentUserId,
  units = [],
  open,
  onOpenChange,
  translations: t,
}: RoleChangeDialogProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const isSelf = user.id === currentUserId;
  const hasLeaderProfile = !!user.leaderProfile;
  const hasParentLinks = user.parentLinks.length > 0;

  // Compute warnings based on current and target role
  const getWarnings = () => {
    if (!selectedRole || selectedRole === user.role) return [];

    const warnings: string[] = [];

    // FROM LEADER warning
    if (user.role === "LEADER" && hasLeaderProfile) {
      warnings.push(t.fromLeaderWarning);
    }

    // FROM PARENT warning
    if (user.role === "PARENT" && hasParentLinks) {
      warnings.push(t.fromParentWarning);
    }

    // TO ADMIN warning
    if (selectedRole === "ADMIN") {
      warnings.push(t.toAdminWarning);
    }

    return warnings;
  };

  const warnings = getWarnings();
  const showUnitSelector = selectedRole === "LEADER" && !hasLeaderProfile;

  const handleConfirm = async () => {
    if (!selectedRole || selectedRole === user.role) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateUserRole(user.id, selectedRole, currentUserId);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("last admin")) {
          setError(t.lastAdminWarning);
        } else if (err.message.includes("own role")) {
          setError(t.cannotChangeSelf);
        } else {
          setError(err.message);
        }
      } else {
        setError(t.common.tryAgain);
      }
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRole(null);
      setSelectedUnitId("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const getRoleLabel = (role: Role) => {
    return t.roles[role.toLowerCase() as keyof typeof t.roles];
  };

  const canConfirm = selectedRole && selectedRole !== user.role && !isSelf;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Current Role */}
          <div className="flex items-center justify-between">
            <Label>{t.currentRole}</Label>
            <Badge variant={roleColors[user.role]}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>

          {/* New Role Selector */}
          <div className="space-y-2">
            <Label>{t.newRole}</Label>
            <Select
              value={selectedRole || ""}
              onValueChange={(value) => setSelectedRole(value as Role)}
              disabled={isLoading || isSelf}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectRole} />
              </SelectTrigger>
              <SelectContent>
                {(["ADMIN", "LEADER", "PARENT"] as Role[]).map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    disabled={role === user.role}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={roleColors[role]} className="text-xs">
                        {getRoleLabel(role)}
                      </Badge>
                      {role === user.role && (
                        <span className="text-muted-foreground text-xs">(current)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSelf && (
              <p className="text-xs text-muted-foreground">{t.cannotChangeSelf}</p>
            )}
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="rounded-md border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 p-3 space-y-2">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500 font-medium text-sm">
                <AlertTriangle className="h-4 w-4" />
                {t.warnings}
              </div>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unit Selector for TO LEADER */}
          {showUnitSelector && units.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t.toLeaderPrompt}</p>
              <Label>{t.selectUnit} ({t.optional})</Label>
              <Select
                value={selectedUnitId}
                onValueChange={setSelectedUnitId}
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
          >
            {isLoading ? t.confirming : t.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
