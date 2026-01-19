"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { addTimelineEntry, type TimelineFormData } from "@/lib/actions/leader-actions";

const timelineSchema = z.object({
  role: z.string().min(1, "Role is required"),
  unitId: z.string().min(1, "Please select a unit"),
  startYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  endYear: z.number().optional().nullable(),
  notes: z.string().optional(),
});

type Unit = { id: string; name: string };

interface LeaderTimelineDialogProps {
  leaderId: string;
  units: Unit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
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
}

export function LeaderTimelineDialog({
  leaderId,
  units,
  open,
  onOpenChange,
  translations: t,
}: LeaderTimelineDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TimelineFormData>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      role: "",
      unitId: "",
      startYear: new Date().getFullYear(),
      endYear: null,
      notes: "",
    },
  });

  const onSubmit = async (data: TimelineFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await addTimelineEntry(leaderId, data);
      reset();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">{t.role} *</Label>
            <Input id="role" {...register("role")} disabled={isLoading} />
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startYear">{t.startYear} *</Label>
              <Input
                id="startYear"
                type="number"
                {...register("startYear", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.startYear && (
                <p className="text-sm text-destructive">{errors.startYear.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endYear">{t.endYear}</Label>
              <Input
                id="endYear"
                type="number"
                {...register("endYear", {
                  setValueAs: (v) => v === "" ? null : parseInt(v, 10),
                })}
                disabled={isLoading}
                placeholder={t.endYearOptional}
              />
              {errors.endYear && (
                <p className="text-sm text-destructive">{errors.endYear.message}</p>
              )}
            </div>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
