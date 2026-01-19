"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  Building,
  BookOpen,
  Heart,
  Pencil,
  Trash2,
  Link as LinkIcon,
  Unlink,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteStudent } from "@/lib/actions/student-actions";
import {
  linkParentToStudent,
  unlinkParentFromStudent,
} from "@/lib/actions/parent-student-actions";

type Student = {
  id: string;
  name: string;
  dharmaName: string | null;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE";
  status: "ACTIVE" | "INACTIVE";
  notes: string | null;
  unit: { id: string; name: string };
  class: { id: string; name: string } | null;
  parents: { parent: { id: string; name: string; email: string } }[];
};

type ParentBasic = {
  id: string;
  name: string;
  email: string;
};

interface StudentDetailSheetProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allParents?: ParentBasic[];
  onEditClick?: () => void;
  translations: {
    viewDetails: string;
    basicInfo: string;
    dharmaName: string;
    dateOfBirth: string;
    gender: string;
    unit: string;
    class: string;
    status: string;
    notes: string;
    linkedParents: string;
    noLinkedParents: string;
    linkParent: string;
    selectParent: string;
    unlink: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    deleteWarning: string;
    male: string;
    female: string;
    active: string;
    inactive: string;
    common: {
      cancel: string;
      delete: string;
      deleting: string;
      tryAgain: string;
    };
  };
}

export function StudentDetailSheet({
  student,
  open,
  onOpenChange,
  allParents = [],
  onEditClick,
  translations: t,
}: StudentDetailSheetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  if (!student) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteStudent(student.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
      setIsLoading(false);
    }
  };

  const handleLinkParent = async () => {
    if (!selectedParentId) return;
    setIsLoading(true);
    try {
      await linkParentToStudent(selectedParentId, student.id);
      setSelectedParentId("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkParent = async (parentId: string) => {
    setIsLoading(true);
    try {
      await unlinkParentFromStudent(parentId, student.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter parents that are not already linked
  const availableParents = allParents.filter(
    (p) => !student.parents.some((link) => link.parent.id === p.id)
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
  };

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
                <SheetTitle>{student.name}</SheetTitle>
                {student.dharmaName && (
                  <SheetDescription>{student.dharmaName}</SheetDescription>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                {student.status === "ACTIVE" ? t.active : t.inactive}
              </Badge>
              <Badge variant="outline">{student.unit.name}</Badge>
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
                  <BookOpen className="h-4 w-4" />
                  {t.basicInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 space-y-3">
                {student.dharmaName && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.dharmaName}</span>
                      <span className="text-sm font-medium">{student.dharmaName}</span>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t.dateOfBirth}
                  </span>
                  <span className="text-sm font-medium">{formatDate(student.dateOfBirth)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.gender}</span>
                  <span className="text-sm font-medium">
                    {student.gender === "MALE" ? t.male : t.female}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {t.unit}
                  </span>
                  <span className="text-sm font-medium">{student.unit.name}</span>
                </div>
                {student.class && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.class}</span>
                      <span className="text-sm font-medium">{student.class.name}</span>
                    </div>
                  </>
                )}
                {student.notes && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">{t.notes}</span>
                      <p className="text-sm mt-1">{student.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Linked Parents Section */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  {t.linkedParents}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 space-y-3">
                {student.parents.length > 0 ? (
                  <div className="space-y-2">
                    {student.parents.map((link) => (
                      <div
                        key={link.parent.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <div>
                          <span className="text-sm font-medium">{link.parent.name}</span>
                          <p className="text-xs text-muted-foreground">{link.parent.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleUnlinkParent(link.parent.id)}
                          disabled={isLoading}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.noLinkedParents}</p>
                )}

                {/* Link Parent Dropdown */}
                {availableParents.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    <Select
                      value={selectedParentId}
                      onValueChange={setSelectedParentId}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t.selectParent} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableParents.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.name}
                            <span className="text-muted-foreground ml-1">
                              ({parent.email})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      onClick={handleLinkParent}
                      disabled={!selectedParentId || isLoading}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <SheetFooter className="mt-6 flex-col gap-2 sm:flex-col">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" onClick={onEditClick} disabled={isLoading}>
                <Pencil className="h-4 w-4 mr-2" />
                {t.edit}
              </Button>
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t.delete}
              </Button>
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
    </>
  );
}
