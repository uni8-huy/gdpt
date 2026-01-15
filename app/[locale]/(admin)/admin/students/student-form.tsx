"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createStudent,
  updateStudent,
  type StudentFormData,
} from "@/lib/actions/student-actions";

const studentSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  dharmaName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Vui lòng nhập ngày sinh"),
  gender: z.enum(["MALE", "FEMALE"]),
  unitId: z.string().min(1, "Vui lòng chọn đơn vị"),
  className: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  notes: z.string().optional(),
});

type Unit = { id: string; name: string };

interface StudentFormProps {
  student?: {
    id: string;
    name: string;
    dharmaName: string | null;
    dateOfBirth: Date;
    gender: "MALE" | "FEMALE";
    unitId: string;
    className: string | null;
    status: "ACTIVE" | "INACTIVE";
    notes: string | null;
  };
  units: Unit[];
  locale: string;
}

export function StudentForm({ student, units, locale }: StudentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || "",
      dharmaName: student?.dharmaName || "",
      dateOfBirth: student?.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: student?.gender || "MALE",
      unitId: student?.unitId || "",
      className: student?.className || "",
      status: student?.status || "ACTIVE",
      notes: student?.notes || "",
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (student) {
        await updateStudent(student.id, data);
      } else {
        await createStudent(data);
      }
      router.push(`/${locale}/admin/students`);
      router.refresh();
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student ? "Cập nhật đoàn sinh" : "Thêm đoàn sinh"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên *</Label>
              <Input id="name" {...register("name")} disabled={isLoading} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dharmaName">Pháp danh</Label>
              <Input
                id="dharmaName"
                {...register("dharmaName")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                disabled={isLoading}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Giới tính *</Label>
              <Select
                value={watch("gender")}
                onValueChange={(value) =>
                  setValue("gender", value as "MALE" | "FEMALE")
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="className">Lớp</Label>
              <Input
                id="className"
                {...register("className")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Trạng thái *</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) =>
                  setValue("status", value as "ACTIVE" | "INACTIVE")
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Nghỉ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input id="notes" {...register("notes")} disabled={isLoading} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : student ? "Cập nhật" : "Thêm mới"}
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
      </CardContent>
    </Card>
  );
}
