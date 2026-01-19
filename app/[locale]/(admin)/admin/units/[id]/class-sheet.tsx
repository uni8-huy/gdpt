"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  createClass,
  updateClass,
  deleteClass,
  type ClassFormData,
} from "@/lib/actions/class-actions";

const classSchema = z.object({
  name: z.string().min(1, "Class name required"),
  unitId: z.string().min(1, "Unit required"),
});

interface ClassSheetProps {
  unitId: string;
  cls?: { id: string; name: string; _count: { students: number } } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
    createTitle: string;
    editTitle: string;
    name: string;
    studentCount: string;
    deleteConfirm: string;
    deleteWarning: string;
    save: string;
    cancel: string;
    delete: string;
    saving: string;
    deleting: string;
    tryAgain: string;
  };
}

export function ClassSheet({
  unitId,
  cls,
  open,
  onOpenChange,
  translations: t,
}: ClassSheetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: cls?.name || "",
      unitId: unitId,
    },
  });

  const onSubmit = async (data: ClassFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (cls) {
        await updateClass(cls.id, data.name);
      } else {
        await createClass(data);
      }
      onOpenChange(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.tryAgain);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!cls) return;
    if (!confirm(t.deleteConfirm)) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteClass(cls.id);
      onOpenChange(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.tryAgain);
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      reset({
        name: cls?.name || "",
        unitId: unitId,
      });
      setError(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{cls ? t.editTitle : t.createTitle}</SheetTitle>
          <SheetDescription>
            {cls ? `${t.editTitle}: ${cls.name}` : t.createTitle}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t.name} *</Label>
            <Input id="name" {...register("name")} disabled={isLoading || isDeleting} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {cls && (
            <div className="space-y-2">
              <Label>{t.studentCount}</Label>
              <Input value={cls._count.students} disabled readOnly />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || isDeleting} className="flex-1">
              {isLoading ? t.saving : t.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isDeleting}
            >
              {t.cancel}
            </Button>
          </div>

          {cls && (
            <>
              {cls._count.students > 0 && (
                <p className="text-sm text-muted-foreground">{t.deleteWarning}</p>
              )}
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || isDeleting || cls._count.students > 0}
                className="w-full"
              >
                {isDeleting ? t.deleting : t.delete}
              </Button>
            </>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
