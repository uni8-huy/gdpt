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
  createUnit,
  updateUnit,
  type UnitFormData,
} from "@/lib/actions/unit-actions";

const unitSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

type Unit = { id: string; name: string };

interface UnitFormProps {
  unit?: {
    id: string;
    name: string;
    description: string | null;
    parentId: string | null;
  };
  allUnits: Unit[];
  locale: string;
}

export function UnitForm({ unit, allUnits, locale }: UnitFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out current unit and its children from parent options
  const parentOptions = allUnits.filter((u) => u.id !== unit?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: unit?.name || "",
      description: unit?.description || "",
      parentId: unit?.parentId || null,
    },
  });

  const onSubmit = async (data: UnitFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (unit) {
        await updateUnit(unit.id, data);
      } else {
        await createUnit(data);
      }
      router.push(`/${locale}/admin/units`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{unit ? "Cập nhật đơn vị" : "Thêm đơn vị"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Tên đơn vị *</Label>
            <Input id="name" {...register("name")} disabled={isLoading} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              {...register("description")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Đơn vị cha</Label>
            <Select
              value={watch("parentId") || "none"}
              onValueChange={(value) =>
                setValue("parentId", value === "none" ? null : value)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn đơn vị cha (nếu có)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có (đơn vị gốc)</SelectItem>
                {parentOptions.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : unit ? "Cập nhật" : "Thêm mới"}
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
