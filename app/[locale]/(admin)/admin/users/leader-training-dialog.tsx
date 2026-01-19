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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { addTrainingRecord, type TrainingFormData } from "@/lib/actions/leader-actions";

const trainingSchema = z.object({
  campName: z.string().min(1, "Camp name is required"),
  year: z.number().min(1900).max(new Date().getFullYear()),
  region: z.string().optional(),
  level: z.string().min(1, "Level is required"),
  notes: z.string().optional(),
});

interface LeaderTrainingDialogProps {
  leaderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
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
}

export function LeaderTrainingDialog({
  leaderId,
  open,
  onOpenChange,
  translations: t,
}: LeaderTrainingDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      campName: "",
      year: new Date().getFullYear(),
      region: "",
      level: "",
      notes: "",
    },
  });

  const onSubmit = async (data: TrainingFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await addTrainingRecord(leaderId, data);
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
            <Label htmlFor="campName">{t.campName} *</Label>
            <Input id="campName" {...register("campName")} disabled={isLoading} />
            {errors.campName && (
              <p className="text-sm text-destructive">{errors.campName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">{t.year} *</Label>
              <Input
                id="year"
                type="number"
                {...register("year", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">{t.level} *</Label>
              <Input id="level" {...register("level")} disabled={isLoading} />
              {errors.level && (
                <p className="text-sm text-destructive">{errors.level.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">{t.region}</Label>
            <Input
              id="region"
              {...register("region")}
              disabled={isLoading}
              placeholder={t.regionOptional}
            />
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
