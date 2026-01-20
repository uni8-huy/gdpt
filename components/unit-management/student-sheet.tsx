"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  createStudent,
  updateStudent,
  type StudentFormData,
} from "@/lib/actions/student-actions";

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dharmaName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  unitId: z.string().min(1, "Unit is required"),
  classId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  notes: z.string().optional(),
});

type Class = { id: string; name: string };
type Unit = { id: string; name: string };

interface Student {
  id: string;
  name: string;
  dharmaName: string | null;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE";
  unitId: string;
  classId: string | null;
  status: "ACTIVE" | "INACTIVE";
  notes: string | null;
}

interface StudentSheetProps {
  unitId: string;
  student: Student | null;
  classes: Class[];
  allUnits: Unit[];
  canMoveUnit?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
    addTitle: string;
    editTitle: string;
    name: string;
    dharmaName: string;
    dateOfBirth: string;
    gender: string;
    unit: string;
    class: string;
    selectClass: string;
    noClass: string;
    status: string;
    notes: string;
    male: string;
    female: string;
    active: string;
    inactive: string;
    common: {
      save: string;
      saving: string;
      cancel: string;
      tryAgain: string;
    };
  };
}

export function StudentSheet({
  unitId,
  student,
  classes,
  allUnits,
  canMoveUnit = true,
  open,
  onOpenChange,
  translations: t,
}: StudentSheetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      dharmaName: "",
      dateOfBirth: "",
      gender: "MALE",
      unitId: unitId,
      classId: null,
      status: "ACTIVE",
      notes: "",
    },
  });

  // Reset form when student changes or sheet opens
  useEffect(() => {
    if (open) {
      if (student) {
        reset({
          name: student.name,
          dharmaName: student.dharmaName || "",
          dateOfBirth: formatDateForInput(student.dateOfBirth),
          gender: student.gender,
          unitId: student.unitId,
          classId: student.classId,
          status: student.status,
          notes: student.notes || "",
        });
      } else {
        reset({
          name: "",
          dharmaName: "",
          dateOfBirth: "",
          gender: "MALE",
          unitId: unitId,
          classId: null,
          status: "ACTIVE",
          notes: "",
        });
      }
      setError(null);
    }
  }, [open, student, unitId, reset]);

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (student) {
        await updateStudent(student.id, data);
      } else {
        await createStudent(data);
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  const watchedUnitId = watch("unitId");

  // Filter classes based on selected unit
  // When canMoveUnit is false, always show classes for the current unit
  const availableClasses = !canMoveUnit || watchedUnitId === unitId ? classes : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{student ? t.editTitle : t.addTitle}</SheetTitle>
          <SheetDescription>
            {student ? `${t.editTitle}: ${student.name}` : t.addTitle}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name} *</Label>
              <Input id="name" {...register("name")} disabled={isLoading} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dharmaName">{t.dharmaName}</Label>
              <Input id="dharmaName" {...register("dharmaName")} disabled={isLoading} />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t.dateOfBirth} *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                disabled={isLoading}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.gender} *</Label>
              <Select
                value={watch("gender")}
                onValueChange={(value) => setValue("gender", value as "MALE" | "FEMALE")}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">{t.male}</SelectItem>
                  <SelectItem value="FEMALE">{t.female}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={canMoveUnit ? "grid gap-4 grid-cols-2" : "space-y-4"}>
            {canMoveUnit && (
              <div className="space-y-2">
                <Label>{t.unit} *</Label>
                <Select
                  value={watchedUnitId}
                  onValueChange={(value) => {
                    setValue("unitId", value);
                    // Clear class if unit changes
                    if (value !== unitId) {
                      setValue("classId", null);
                    }
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t.class}</Label>
              <Select
                value={watch("classId") || "none"}
                onValueChange={(value) => setValue("classId", value === "none" ? null : value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectClass} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.noClass}</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canMoveUnit && watchedUnitId !== unitId && (
                <p className="text-xs text-muted-foreground">
                  Class will be cleared when moving to different unit
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.status} *</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as "ACTIVE" | "INACTIVE")}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">{t.active}</SelectItem>
                <SelectItem value="INACTIVE">{t.inactive}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.notes}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? t.common.saving : t.common.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
