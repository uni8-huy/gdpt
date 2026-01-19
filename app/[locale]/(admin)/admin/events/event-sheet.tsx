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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  createEvent,
  updateEvent,
  type EventFormData,
} from "@/lib/actions/event-actions";

const eventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  isPublic: z.boolean(),
  targetRoles: z.array(z.enum(["ADMIN", "LEADER", "PARENT"])),
});

type Event = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  isPublic: boolean;
  targetRoles: string[];
};

interface EventSheetProps {
  event?: Event;
  translations: {
    addNew: string;
    edit: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    isPublic: string;
    targetRoles: string;
    publicOnHome: string;
    roles: {
      admin: string;
      leader: string;
      parent: string;
    };
    common: {
      save: string;
      saving: string;
      cancel: string;
      tryAgain: string;
    };
  };
  trigger?: "button" | "icon";
}

function formatDateTimeForInput(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 16);
}

export function EventSheet({ event, translations: t, trigger = "button" }: EventSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ROLES = [
    { value: "ADMIN" as const, label: t.roles.admin },
    { value: "LEADER" as const, label: t.roles.leader },
    { value: "PARENT" as const, label: t.roles.parent },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      startDate: formatDateTimeForInput(event?.startDate || null),
      endDate: formatDateTimeForInput(event?.endDate || null),
      location: event?.location || "",
      isPublic: event?.isPublic ?? true,
      targetRoles: (event?.targetRoles as ("ADMIN" | "LEADER" | "PARENT")[]) || ["ADMIN", "LEADER", "PARENT"],
    },
  });

  const selectedRoles = watch("targetRoles") || [];

  const toggleRole = (role: "ADMIN" | "LEADER" | "PARENT") => {
    const current = selectedRoles;
    const newRoles = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    setValue("targetRoles", newRoles);
  };

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (event) {
        await updateEvent(event.id, data);
      } else {
        await createEvent(data);
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
        title: event?.title || "",
        description: event?.description || "",
        startDate: formatDateTimeForInput(event?.startDate || null),
        endDate: formatDateTimeForInput(event?.endDate || null),
        location: event?.location || "",
        isPublic: event?.isPublic ?? true,
        targetRoles: (event?.targetRoles as ("ADMIN" | "LEADER" | "PARENT")[]) || ["ADMIN", "LEADER", "PARENT"],
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

          <div className="space-y-2">
            <Label htmlFor="title">{t.title} *</Label>
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

          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="isPublic"
                checked={watch("isPublic")}
                onCheckedChange={(checked) => setValue("isPublic", checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="isPublic">{t.publicOnHome}</Label>
            </div>

            <div className="space-y-2">
              <Label>{t.targetRoles}</Label>
              <div className="flex flex-wrap gap-4">
                {ROLES.map((role) => (
                  <div key={role.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`role-${role.value}`}
                      checked={selectedRoles.includes(role.value)}
                      onCheckedChange={() => toggleRole(role.value)}
                      disabled={isLoading}
                    />
                    <Label htmlFor={`role-${role.value}`}>{role.label}</Label>
                  </div>
                ))}
              </div>
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
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
