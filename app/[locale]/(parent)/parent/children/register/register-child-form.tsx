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
  createStudentSubmission,
  type SubmissionFormData,
} from "@/lib/actions/submission-actions";
import { getClassesByUnit } from "@/lib/actions/student-actions";

const submissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dharmaName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  unitId: z.string().min(1, "Unit is required"),
  classId: z.string().optional().nullable(),
  notes: z.string().optional(),
  submissionNotes: z.string().optional(),
});

type FormData = z.infer<typeof submissionSchema>;

type Unit = { id: string; name: string };

interface RegisterChildFormProps {
  parentId: string;
  units: Unit[];
  translations: {
    name: string;
    dharmaName: string;
    dateOfBirth: string;
    gender: string;
    unit: string;
    class: string;
    selectClass: string;
    noClass: string;
    notes: string;
    selectUnit: string;
    male: string;
    female: string;
    submissionNotes: string;
    submitRegistration: string;
    common: {
      save: string;
      saving: string;
      cancel: string;
      tryAgain: string;
    };
  };
}

export function RegisterChildForm({
  parentId,
  units,
  translations: t,
}: RegisterChildFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      name: "",
      dharmaName: "",
      dateOfBirth: "",
      gender: "MALE",
      unitId: "",
      classId: null,
      notes: "",
      submissionNotes: "",
    },
  });

  // Fetch classes when unit changes
  useEffect(() => {
    const unitId = watch("unitId");
    if (unitId) {
      getClassesByUnit(unitId).then(setClasses);
      setValue("classId", null);
    } else {
      setClasses([]);
      setValue("classId", null);
    }
  }, [watch("unitId"), setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { submissionNotes, ...studentData } = data;
      await createStudentSubmission(parentId, studentData, submissionNotes);
      router.push("/parent/children/submissions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
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
        <Label htmlFor="notes">{t.notes}</Label>
        <Input id="notes" {...register("notes")} disabled={isLoading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="submissionNotes">{t.submissionNotes}</Label>
        <Textarea
          id="submissionNotes"
          {...register("submissionNotes")}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? t.common.saving : t.submitRegistration}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          {t.common.cancel}
        </Button>
      </div>
    </form>
  );
}
