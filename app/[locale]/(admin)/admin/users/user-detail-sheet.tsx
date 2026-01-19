"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  Shield,
  UserCog,
  KeyRound,
  Trash2,
  ExternalLink,
  Pencil,
  Link as LinkIcon,
  Unlink,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { resetUserPassword, deleteUser, createLeaderProfile } from "@/lib/actions/user-actions";
import {
  linkParentToStudent,
  unlinkParentFromStudent,
} from "@/lib/actions/parent-student-actions";
import type { UserWithRelations } from "@/lib/actions/user-actions";
import { LeaderProfileTabs } from "./leader-profile-tabs";
import { LeaderTimelineDialog } from "./leader-timeline-dialog";
import { LeaderTrainingDialog } from "./leader-training-dialog";

type StudentBasic = {
  id: string;
  name: string;
  unit?: { name: string };
};

type Unit = { id: string; name: string };

interface UserDetailSheetProps {
  user: UserWithRelations | null;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allStudents?: StudentBasic[];
  units?: Unit[];
  onEditClick?: () => void;
  onRoleChangeClick?: () => void;
  translations: {
    viewDetails: string;
    basicInfo: string;
    email: string;
    role: string;
    createdAt: string;
    leaderProfile: string;
    unit: string;
    level: string;
    dharmaName: string;
    viewFullProfile: string;
    noLeaderProfile: string;
    linkedStudents: string;
    noLinkedStudents: string;
    linkStudent: string;
    selectStudent: string;
    unlink: string;
    edit: string;
    changeRole: string;
    resetPassword: string;
    deleteUser: string;
    resetPasswordConfirm: string;
    resetPasswordDesc: string;
    resetPasswordSuccess: string;
    temporaryPassword: string;
    copyPassword: string;
    passwordCopied: string;
    passwordResetNote: string;
    deleteConfirm: string;
    deleteWarning: string;
    cannotDeleteSelf: string;
    copyEmail: string;
    emailCopied: string;
    createLeaderProfile: string;
    leaderProfileTabs?: {
      summary: string;
      personal: string;
      gdpt: string;
      contact: string;
      timeline: string;
      training: string;
      name: string;
      dharmaName: string;
      yearOfBirth: string;
      fullDateOfBirth: string;
      unit: string;
      level: string;
      status: string;
      placeOfOrigin: string;
      education: string;
      occupation: string;
      phone: string;
      address: string;
      gdptJoinDate: string;
      quyYDate: string;
      quyYName: string;
      notes: string;
      save: string;
      saving: string;
      cancel: string;
      active: string;
      inactive: string;
      selectUnit: string;
      selectLevel: string;
      addTimeline: string;
      addTraining: string;
      role: string;
      startYear: string;
      endYear: string;
      current: string;
      campName: string;
      year: string;
      region: string;
      delete: string;
      noTimeline: string;
      noTraining: string;
    };
    timelineDialog?: {
      title: string;
      description: string;
      role: string;
      unit: string;
      selectUnit: string;
      startYear: string;
      endYear: string;
      endYearOptional: string;
      notes: string;
      save: string;
      saving: string;
      cancel: string;
    };
    trainingDialog?: {
      title: string;
      description: string;
      campName: string;
      year: string;
      region: string;
      regionOptional: string;
      level: string;
      notes: string;
      save: string;
      saving: string;
      cancel: string;
    };
    roles: {
      admin: string;
      leader: string;
      parent: string;
    };
    status: {
      active: string;
      inactive: string;
    };
    common: {
      cancel: string;
      delete: string;
      deleting: string;
      tryAgain: string;
    };
  };
}

const roleColors: Record<Role, "destructive" | "default" | "secondary"> = {
  ADMIN: "destructive",
  LEADER: "default",
  PARENT: "secondary",
};

export function UserDetailSheet({
  user,
  currentUserId,
  open,
  onOpenChange,
  allStudents = [],
  units = [],
  onEditClick,
  onRoleChangeClick,
  translations: t,
}: UserDetailSheetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [showCreateLeaderDialog, setShowCreateLeaderDialog] = useState(false);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);

  if (!user) return null;

  const isSelf = user.id === currentUserId;
  const roleLabel = t.roles[user.role.toLowerCase() as keyof typeof t.roles];

  const handleResetPassword = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await resetUserPassword(user.id);
      setTempPassword(result.tempPassword);
      setShowPasswordDialog(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteUser(user.id, currentUserId);
      setShowDeleteDialog(false);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
      setIsLoading(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!selectedStudentId) return;
    setIsLoading(true);
    try {
      await linkParentToStudent(user.id, selectedStudentId);
      setSelectedStudentId("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkStudent = async (studentId: string) => {
    setIsLoading(true);
    try {
      await unlinkParentFromStudent(user.id, studentId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(user.email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleCreateLeaderProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      await createLeaderProfile(user.id, {
        name: user.name,
        yearOfBirth: new Date().getFullYear() - 30,
        unitId: units[0]?.id || "",
      });
      setShowCreateLeaderDialog(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students that are not already linked
  const availableStudents = allStudents.filter(
    (s) => !user.parentLinks.some((link) => link.student.id === s.id)
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <SheetTitle>{user.name}</SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  {user.email}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={copyEmail}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {emailCopied && (
                    <span className="text-xs text-green-600">{t.emailCopied}</span>
                  )}
                </SheetDescription>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant={roleColors[user.role]}>{roleLabel}</Badge>
              <Badge variant={user.emailVerified ? "default" : "outline"} className={user.emailVerified ? "bg-green-500" : ""}>
                {user.emailVerified ? t.status.active : t.status.inactive}
              </Badge>
            </div>
          </SheetHeader>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mt-4">
              {error}
            </div>
          )}

          <div className="space-y-4 mt-6">
            {/* Basic Info Section */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t.basicInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t.email}
                  </span>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t.createdAt}
                  </span>
                  <span className="text-sm font-medium">
                    {new Intl.DateTimeFormat("vi-VN").format(new Date(user.createdAt))}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Leader Section (if role is LEADER) */}
            {user.role === "LEADER" && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">{t.leaderProfile}</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  {user.leaderProfile ? (
                    t.leaderProfileTabs && (
                      <LeaderProfileTabs
                        leaderProfile={user.leaderProfile as any}
                        units={units}
                        translations={t.leaderProfileTabs}
                        onShowTimelineDialog={() => setShowTimelineDialog(true)}
                        onShowTrainingDialog={() => setShowTrainingDialog(true)}
                      />
                    )
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">{t.noLeaderProfile}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateLeaderDialog(true)}
                        disabled={isLoading || units.length === 0}
                      >
                        {t.createLeaderProfile}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Parent Section (if role is PARENT or has parent links) */}
            {(user.role === "PARENT" || user.parentLinks.length > 0) && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">{t.linkedStudents}</CardTitle>
                </CardHeader>
                <CardContent className="py-3 space-y-3">
                  {user.parentLinks.length > 0 ? (
                    <div className="space-y-2">
                      {user.parentLinks.map((link) => (
                        <div
                          key={link.student.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                        >
                          <span className="text-sm font-medium">{link.student.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleUnlinkStudent(link.student.id)}
                            disabled={isLoading}
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.noLinkedStudents}</p>
                  )}

                  {/* Link Student Dropdown */}
                  {availableStudents.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      <Select
                        value={selectedStudentId}
                        onValueChange={setSelectedStudentId}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={t.selectStudent} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStudents.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                              {student.unit && (
                                <span className="text-muted-foreground ml-1">
                                  ({student.unit.name})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        onClick={handleLinkStudent}
                        disabled={!selectedStudentId || isLoading}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer Actions */}
          <SheetFooter className="mt-6 flex-col gap-2 sm:flex-col">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" onClick={onEditClick} disabled={isLoading}>
                <Pencil className="h-4 w-4 mr-2" />
                {t.edit}
              </Button>
              {!isSelf && (
                <Button variant="outline" onClick={onRoleChangeClick} disabled={isLoading}>
                  <UserCog className="h-4 w-4 mr-2" />
                  {t.changeRole}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" onClick={handleResetPassword} disabled={isLoading}>
                <KeyRound className="h-4 w-4 mr-2" />
                {t.resetPassword}
              </Button>
              {!isSelf && (
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.deleteUser}
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteWarning}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? t.common.deleting : t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Result Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.resetPasswordSuccess}</DialogTitle>
            <DialogDescription>{t.passwordResetNote}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">{t.temporaryPassword}</p>
              <div className="flex gap-2">
                <Input value={tempPassword || ""} readOnly className="font-mono" />
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? t.passwordCopied : t.copyPassword}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Leader Profile Confirmation Dialog */}
      <AlertDialog open={showCreateLeaderDialog} onOpenChange={setShowCreateLeaderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.createLeaderProfile}</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a leader profile for {user?.name} and change their role to LEADER.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateLeaderProfile} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Timeline Dialog */}
      {user?.leaderProfile && t.timelineDialog && (
        <LeaderTimelineDialog
          leaderId={user.leaderProfile.id}
          units={units}
          open={showTimelineDialog}
          onOpenChange={setShowTimelineDialog}
          translations={t.timelineDialog}
        />
      )}

      {/* Training Dialog */}
      {user?.leaderProfile && t.trainingDialog && (
        <LeaderTrainingDialog
          leaderId={user.leaderProfile.id}
          open={showTrainingDialog}
          onOpenChange={setShowTrainingDialog}
          translations={t.trainingDialog}
        />
      )}
    </>
  );
}
