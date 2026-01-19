"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  createEventAsLeader,
  updateEventAsLeader,
  deleteEventAsLeader,
  type LeaderEventFormData,
} from "@/lib/actions/leader-event-actions";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  isPublic: z.boolean(),
});

interface EventSheetProps {
  event?: {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    location: string | null;
    isPublic: boolean;
  };
  userId: string;
  translations: {
    addNew: string;
    edit: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    isPublic: string;
    publicOnHome: string;
    eventInfo: string;
    displaySettings: string;
    common: {
      save: string;
      saving: string;
      cancel: string;
      tryAgain: string;
    };
  };
  trigger?: "button" | "icon";
}

export function EventSheet({
  event,
  userId,
  translations: t,
  trigger = "button",
}: EventSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateTimeForInput = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaderEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      startDate: event ? formatDateTimeForInput(event.startDate) : "",
      endDate: event?.endDate ? formatDateTimeForInput(event.endDate) : "",
      location: event?.location || "",
      isPublic: event?.isPublic ?? true,
    },
  });

  const onSubmit = async (data: LeaderEventFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (event) {
        await updateEventAsLeader(userId, event.id, data);
      } else {
        await createEventAsLeader(userId, data);
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm("Delete this event?")) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteEventAsLeader(userId, event.id);
      setOpen(false);
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
        title: event?.title || "",
        description: event?.description || "",
        startDate: event ? formatDateTimeForInput(event.startDate) : "",
        endDate: event?.endDate ? formatDateTimeForInput(event.endDate) : "",
        location: event?.location || "",
        isPublic: event?.isPublic ?? true,
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
          <SheetTitle>{event ? t.edit : t.addNew}</SheetTitle>
          <SheetDescription>
            {event ? `${t.edit}: ${event.title}` : t.addNew}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t.eventInfo}</h3>

            <div className="space-y-2">
              <Label htmlFor="title">{t.name} *</Label>
              <Input id="title" {...register("title")} disabled={isLoading} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                {...register("description")}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t.startDate} *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  {...register("startDate")}
                  disabled={isLoading}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t.endDate}</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  {...register("endDate")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t.location}</Label>
              <Input id="location" {...register("location")} disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">{t.displaySettings}</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic" className="cursor-pointer">
                {t.publicOnHome}
              </Label>
              <Switch
                id="isPublic"
                checked={watch("isPublic")}
                onCheckedChange={(checked) => setValue("isPublic", checked)}
                disabled={isLoading}
              />
            </div>
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
            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
