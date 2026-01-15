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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createLeader,
  updateLeader,
  type LeaderFormData,
} from "@/lib/actions/leader-actions";

const leaderSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  dharmaName: z.string().optional(),
  yearOfBirth: z.number().min(1900).max(new Date().getFullYear()),
  unitId: z.string().min(1, "Vui lòng chọn đơn vị"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  fullDateOfBirth: z.string().optional(),
  placeOfOrigin: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gdptJoinDate: z.string().optional(),
  quyYDate: z.string().optional(),
  quyYName: z.string().optional(),
  level: z.string().optional(),
  notes: z.string().optional(),
});

type Unit = { id: string; name: string };
type User = { id: string; name: string; email: string };
type Leader = {
  id: string;
  userId: string;
  name: string;
  dharmaName: string | null;
  yearOfBirth: number;
  unitId: string;
  status: "ACTIVE" | "INACTIVE";
  fullDateOfBirth: Date | null;
  placeOfOrigin: string | null;
  education: string | null;
  occupation: string | null;
  phone: string | null;
  address: string | null;
  gdptJoinDate: Date | null;
  quyYDate: Date | null;
  quyYName: string | null;
  level: string | null;
  notes: string | null;
};

interface LeaderFormProps {
  leader?: Leader;
  units: Unit[];
  availableUsers: User[];
  locale: string;
}

const LEVELS = ["Tập", "Tín", "Tấn", "Dũng", "Kiên", "Trì", "Định", "Lực"];

function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export function LeaderForm({ leader, units, availableUsers, locale }: LeaderFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>(leader?.userId || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaderFormData>({
    resolver: zodResolver(leaderSchema),
    defaultValues: {
      name: leader?.name || "",
      dharmaName: leader?.dharmaName || "",
      yearOfBirth: leader?.yearOfBirth || new Date().getFullYear() - 30,
      unitId: leader?.unitId || "",
      status: leader?.status || "ACTIVE",
      fullDateOfBirth: formatDateForInput(leader?.fullDateOfBirth || null),
      placeOfOrigin: leader?.placeOfOrigin || "",
      education: leader?.education || "",
      occupation: leader?.occupation || "",
      phone: leader?.phone || "",
      address: leader?.address || "",
      gdptJoinDate: formatDateForInput(leader?.gdptJoinDate || null),
      quyYDate: formatDateForInput(leader?.quyYDate || null),
      quyYName: leader?.quyYName || "",
      level: leader?.level || "",
      notes: leader?.notes || "",
    },
  });

  const onSubmit = async (data: LeaderFormData) => {
    if (!leader && !selectedUserId) {
      setError("Vui lòng chọn tài khoản người dùng");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (leader) {
        await updateLeader(leader.id, data);
      } else {
        await createLeader(selectedUserId, data);
      }
      router.push(`/${locale}/admin/leaders`);
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

      {/* User Selection - only for new leaders */}
      {!leader && (
        <Card>
          <CardHeader>
            <CardTitle>Tài khoản người dùng *</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tài khoản để liên kết" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableUsers.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Không có tài khoản khả dụng. Tất cả người dùng đã có hồ sơ huynh trưởng.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Họ tên *</Label>
            <Input id="name" {...register("name")} disabled={isLoading} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dharmaName">Pháp danh</Label>
            <Input id="dharmaName" {...register("dharmaName")} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearOfBirth">Năm sinh *</Label>
            <Input
              id="yearOfBirth"
              type="number"
              {...register("yearOfBirth", { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.yearOfBirth && (
              <p className="text-sm text-destructive">{errors.yearOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDateOfBirth">Ngày sinh đầy đủ</Label>
            <Input
              id="fullDateOfBirth"
              type="date"
              {...register("fullDateOfBirth")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Đơn vị *</Label>
            <Select
              value={watch("unitId")}
              onValueChange={(value) => setValue("unitId", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn đơn vị" />
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
            <Label>Bậc</Label>
            <Select
              value={watch("level") || "none"}
              onValueChange={(value) => setValue("level", value === "none" ? "" : value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn bậc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Chưa xác định</SelectItem>
                {LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as "ACTIVE" | "INACTIVE")}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Nghỉ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeOfOrigin">Quê quán</Label>
            <Input id="placeOfOrigin" {...register("placeOfOrigin")} disabled={isLoading} />
          </div>
        </CardContent>
      </Card>

      {/* GĐPT & Quy Y Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin GĐPT & Quy Y</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gdptJoinDate">Ngày gia nhập GĐPT</Label>
            <Input
              id="gdptJoinDate"
              type="date"
              {...register("gdptJoinDate")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quyYDate">Ngày Quy Y</Label>
            <Input
              id="quyYDate"
              type="date"
              {...register("quyYDate")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="quyYName">Pháp danh Quy Y</Label>
            <Input id="quyYName" {...register("quyYName")} disabled={isLoading} />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin liên hệ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Điện thoại</Label>
            <Input id="phone" {...register("phone")} disabled={isLoading} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" {...register("address")} disabled={isLoading} />
          </div>
        </CardContent>
      </Card>

      {/* Education & Work */}
      <Card>
        <CardHeader>
          <CardTitle>Học vấn & Nghề nghiệp</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="education">Học vấn</Label>
            <Input id="education" {...register("education")} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Nghề nghiệp</Label>
            <Input id="occupation" {...register("occupation")} disabled={isLoading} />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Ghi chú</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            {...register("notes")}
            disabled={isLoading}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang lưu..." : leader ? "Cập nhật" : "Thêm mới"}
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
