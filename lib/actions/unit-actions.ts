"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

const unitSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

export type UnitFormData = z.infer<typeof unitSchema>;

export async function getUnitsWithHierarchy() {
  return db.unit.findMany({
    include: {
      parent: true,
      children: true,
      _count: {
        select: { students: true, leaders: true, classes: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getUnit(id: string) {
  return db.unit.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      students: { take: 10, orderBy: { name: "asc" } },
      leaders: { take: 10, orderBy: { name: "asc" } },
    },
  });
}

export async function createUnit(data: UnitFormData) {
  const validated = unitSchema.parse(data);

  const unit = await db.unit.create({
    data: {
      name: validated.name,
      description: validated.description || null,
      parentId: validated.parentId || null,
    },
  });

  revalidatePath("/admin/units");
  return { success: true, unit };
}

export async function updateUnit(id: string, data: UnitFormData) {
  const validated = unitSchema.parse(data);

  // Prevent circular reference
  if (validated.parentId === id) {
    throw new Error("Đơn vị không thể là đơn vị cha của chính nó");
  }

  const unit = await db.unit.update({
    where: { id },
    data: {
      name: validated.name,
      description: validated.description || null,
      parentId: validated.parentId || null,
    },
  });

  revalidatePath("/admin/units");
  revalidatePath(`/admin/units/${id}`);
  return { success: true, unit };
}

export async function deleteUnit(id: string) {
  // Check if unit has children or members
  const unit = await db.unit.findUnique({
    where: { id },
    include: {
      _count: {
        select: { children: true, students: true, leaders: true },
      },
    },
  });

  if (!unit) {
    throw new Error("Đơn vị không tồn tại");
  }

  if (unit._count.children > 0) {
    throw new Error("Không thể xóa đơn vị có đơn vị con");
  }

  if (unit._count.students > 0 || unit._count.leaders > 0) {
    throw new Error("Không thể xóa đơn vị có đoàn sinh hoặc huynh trưởng");
  }

  await db.unit.delete({
    where: { id },
  });

  revalidatePath("/admin/units");
  return { success: true };
}
