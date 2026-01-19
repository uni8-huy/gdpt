"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

const classSchema = z.object({
  name: z.string().min(1, "Class name required"),
  unitId: z.string().min(1, "Unit required"),
});

export type ClassFormData = z.infer<typeof classSchema>;

export async function getClassesByUnit(unitId: string) {
  return db.class.findMany({
    where: { unitId },
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createClass(data: ClassFormData) {
  const validated = classSchema.parse(data);

  // Check unique name within unit
  const existing = await db.class.findFirst({
    where: { unitId: validated.unitId, name: validated.name },
  });
  if (existing) {
    throw new Error("Class name already exists in this unit");
  }

  const cls = await db.class.create({
    data: { name: validated.name, unitId: validated.unitId },
  });

  revalidatePath(`/admin/units/${validated.unitId}`);
  return { success: true, class: cls };
}

export async function updateClass(id: string, name: string) {
  const cls = await db.class.findUnique({ where: { id } });
  if (!cls) {
    throw new Error("Class not found");
  }

  // Check unique name within unit
  const existing = await db.class.findFirst({
    where: { unitId: cls.unitId, name, id: { not: id } },
  });
  if (existing) {
    throw new Error("Class name already exists in this unit");
  }

  await db.class.update({ where: { id }, data: { name } });

  revalidatePath(`/admin/units/${cls.unitId}`);
  return { success: true };
}

export async function deleteClass(id: string) {
  const cls = await db.class.findUnique({
    where: { id },
    include: { _count: { select: { students: true } } },
  });
  if (!cls) {
    throw new Error("Class not found");
  }
  if (cls._count.students > 0) {
    throw new Error("Cannot delete class with students. Reassign students first.");
  }

  await db.class.delete({ where: { id } });

  revalidatePath(`/admin/units/${cls.unitId}`);
  return { success: true };
}
