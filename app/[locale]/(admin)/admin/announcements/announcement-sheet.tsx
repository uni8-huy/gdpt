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
  createAnnouncement,
  updateAnnouncement,
  type AnnouncementFormData,
} from "@/lib/actions/announcement-actions";

const announcementSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  isPublished: z.boolean(),
  isPublic: z.boolean(),
  targetRoles: z.array(z.enum(["ADMIN", "LEADER", "PARENT"])),
});

type Announcement = {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  isPublic: boolean;
  targetRoles: string[];
};

interface AnnouncementSheetProps {
  announcement?: Announcement;
  authorId: string;
  translations: {
    addNew: string;
    edit: string;
    title: string;
    content: string;
    isPublished: string;
    isPublic: string;
    publicOnLanding: string;
    targetRoles: string;
    publishNow: string;
    draftNote: string;
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

export function AnnouncementSheet({ announcement, authorId, translations: t, trigger = "button" }: AnnouncementSheetProps) {
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
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || "",
      content: announcement?.content || "",
      isPublished: announcement?.isPublished ?? false,
      isPublic: announcement?.isPublic ?? false,
      targetRoles: (announcement?.targetRoles as ("ADMIN" | "LEADER" | "PARENT")[]) || ["ADMIN", "LEADER", "PARENT"],
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

  const onSubmit = async (data: AnnouncementFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (announcement) {
        await updateAnnouncement(announcement.id, data);
      } else {
        await createAnnouncement(authorId, data);
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
        title: announcement?.title || "",
        content: announcement?.content || "",
        isPublished: announcement?.isPublished ?? false,
        isPublic: announcement?.isPublic ?? false,
        targetRoles: (announcement?.targetRoles as ("ADMIN" | "LEADER" | "PARENT")[]) || ["ADMIN", "LEADER", "PARENT"],
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
          <SheetTitle>{announcement ? t.edit : t.addNew}</SheetTitle>
          <SheetDescription>
            {announcement ? `${t.edit}: ${announcement.title}` : t.addNew}
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
            <Label htmlFor="content">{t.content} *</Label>
            <Textarea
              id="content"
              {...register("content")}
              disabled={isLoading}
              rows={6}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div className="space-y-4 pt-2 border-t">
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isPublished"
                  checked={watch("isPublished")}
                  onCheckedChange={(checked) => setValue("isPublished", checked === true)}
                  disabled={isLoading}
                />
                <Label htmlFor="isPublished">{t.publishNow}</Label>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.draftNote}</p>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isPublic"
                  checked={watch("isPublic")}
                  onCheckedChange={(checked) => setValue("isPublic", checked === true)}
                  disabled={isLoading}
                />
                <Label htmlFor="isPublic">{t.isPublic}</Label>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.publicOnLanding}</p>
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
