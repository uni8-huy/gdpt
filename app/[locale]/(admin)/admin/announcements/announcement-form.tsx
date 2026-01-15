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
  createAnnouncement,
  updateAnnouncement,
  type AnnouncementFormData,
} from "@/lib/actions/announcement-actions";

const announcementSchema = z.object({
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
  isPublished: z.boolean(),
  targetRoles: z.array(z.enum(["ADMIN", "LEADER", "PARENT"])),
});

type Announcement = {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  targetRoles: string[];
};

interface AnnouncementFormProps {
  announcement?: Announcement;
  authorId: string;
  locale: string;
}

const ROLES = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "LEADER", label: "Huynh trưởng" },
  { value: "PARENT", label: "Phụ huynh" },
] as const;

export function AnnouncementForm({ announcement, authorId, locale }: AnnouncementFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || "",
      content: announcement?.content || "",
      isPublished: announcement?.isPublished ?? false,
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
      router.push(`/${locale}/admin/announcements`);
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
          <CardTitle>Nội dung thông báo</CardTitle>
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
            <Label htmlFor="content">Nội dung *</Label>
            <Textarea
              id="content"
              {...register("content")}
              disabled={isLoading}
              rows={8}
              placeholder="Nhập nội dung thông báo..."
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt đăng tải</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublished"
              checked={watch("isPublished")}
              onCheckedChange={(checked) => setValue("isPublished", checked === true)}
              disabled={isLoading}
            />
            <Label htmlFor="isPublished">Đăng tải ngay</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Nếu không chọn, thông báo sẽ được lưu dưới dạng nháp.
          </p>

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
          {isLoading ? "Đang lưu..." : announcement ? "Cập nhật" : "Thêm mới"}
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
