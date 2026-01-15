"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  dharmaName: z.string().optional(),
  dateOfBirth: z.string(),
  gender: z.enum(["MALE", "FEMALE"]),
  unitId: z.string().min(1, "Vui lòng chọn đơn vị"),
  className: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  notes: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;

export async function getStudents() {
  return db.student.findMany({
    include: { unit: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudent(id: string) {
  return db.student.findUnique({
    where: { id },
    include: { unit: true, parents: { include: { parent: true } } },
  });
}

export async function createStudent(data: StudentFormData) {
  const validated = studentSchema.parse(data);

  const student = await db.student.create({
    data: {
      name: validated.name,
      dharmaName: validated.dharmaName || null,
      dateOfBirth: new Date(validated.dateOfBirth),
      gender: validated.gender,
      unitId: validated.unitId,
      className: validated.className || null,
      status: validated.status,
      notes: validated.notes || null,
    },
  });

  revalidatePath("/admin/students");
  return { success: true, student };
}

export async function updateStudent(id: string, data: StudentFormData) {
  const validated = studentSchema.parse(data);

  const student = await db.student.update({
    where: { id },
    data: {
      name: validated.name,
      dharmaName: validated.dharmaName || null,
      dateOfBirth: new Date(validated.dateOfBirth),
      gender: validated.gender,
      unitId: validated.unitId,
      className: validated.className || null,
      status: validated.status,
      notes: validated.notes || null,
    },
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  return { success: true, student };
}

export async function deleteStudent(id: string) {
  await db.student.delete({
    where: { id },
  });

  revalidatePath("/admin/students");
  return { success: true };
}

export async function getUnits() {
  return db.unit.findMany({
    orderBy: { name: "asc" },
  });
}
