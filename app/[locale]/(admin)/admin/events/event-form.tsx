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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createEvent,
  updateEvent,
  type EventFormData,
} from "@/lib/actions/event-actions";

const eventSchema = z.object({
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
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

interface EventFormProps {
  event?: Event;
  locale: string;
}

function formatDateTimeForInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

const ROLES = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "LEADER", label: "Huynh trưởng" },
  { value: "PARENT", label: "Phụ huynh" },
] as const;

export function EventForm({ event, locale }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      router.push(`/${locale}/admin/events`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Thông tin sự kiện</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input id="title" {...register("title")} disabled={isLoading} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register("description")}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Thời gian bắt đầu *</Label>
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
              <Label htmlFor="endDate">Thời gian kết thúc</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register("endDate")}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Địa điểm</Label>
            <Input id="location" {...register("location")} disabled={isLoading} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublic"
              checked={watch("isPublic")}
              onCheckedChange={(checked) => setValue("isPublic", checked === true)}
              disabled={isLoading}
            />
            <Label htmlFor="isPublic">Hiển thị công khai trên trang chủ</Label>
          </div>

          <div className="space-y-2">
            <Label>Đối tượng nhận thông báo</Label>
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
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang lưu..." : event ? "Cập nhật" : "Thêm mới"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
