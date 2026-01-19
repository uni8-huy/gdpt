"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  createStudent,
  updateStudent,
  getClassesByUnit,
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

type Unit = { id: string; name: string };

interface StudentSheetProps {
  student?: {
    id: string;
    name: string;
    dharmaName: string | null;
    dateOfBirth: Date;
    gender: "MALE" | "FEMALE";
    unitId: string;
    classId: string | null;
    status: "ACTIVE" | "INACTIVE";
    notes: string | null;
  };
  units: Unit[];
  translations: {
    addNew: string;
    edit: string;
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
    selectUnit: string;
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
  trigger?: "button" | "icon";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StudentSheet({
  student,
  units,
  translations: t,
  trigger = "button",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: StudentSheetProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);

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
      name: student?.name || "",
      dharmaName: student?.dharmaName || "",
      dateOfBirth: student ? formatDateForInput(student.dateOfBirth) : "",
      gender: student?.gender || "MALE",
      unitId: student?.unitId || "",
      classId: student?.classId || null,
      status: student?.status || "ACTIVE",
      notes: student?.notes || "",
    },
  });

  // Fetch classes when unit changes
  useEffect(() => {
    const unitId = watch("unitId");
    if (unitId) {
      getClassesByUnit(unitId).then(setClasses);
      // Reset classId when unit changes (unless editing existing student)
      if (!student || student.unitId !== unitId) {
        setValue("classId", null);
      }
    } else {
      setClasses([]);
      setValue("classId", null);
    }
  }, [watch("unitId"), student, setValue]);

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (student) {
        await updateStudent(student.id, data);
      } else {
        await createStudent(data);
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset({
        name: student?.name || "",
        dharmaName: student?.dharmaName || "",
        dateOfBirth: student ? formatDateForInput(student.dateOfBirth) : "",
        gender: student?.gender || "MALE",
        unitId: student?.unitId || "",
        classId: student?.classId || null,
        status: student?.status || "ACTIVE",
        notes: student?.notes || "",
      });
      setError(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger === "icon" ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            {t.edit}
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t.addNew}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{student ? t.edit : t.addNew}</SheetTitle>
          <SheetDescription>
            {student ? `${t.edit}: ${student.name}` : t.addNew}
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

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label>{t.unit} *</Label>
              <Select
                value={watch("unitId")}
                onValueChange={(value) => setValue("unitId", value)}
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
              {errors.unitId && (
                <p className="text-sm text-destructive">{errors.unitId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.class}</Label>
              <Select
                value={watch("classId") || "none"}
                onValueChange={(value) => setValue("classId", value === "none" ? null : value)}
                disabled={isLoading || !watch("unitId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectClass} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.noClass}</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Input id="notes" {...register("notes")} disabled={isLoading} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? t.common.saving : t.common.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
