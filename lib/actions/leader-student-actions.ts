"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().min(2),
  dharmaName: z.string().optional(),
  dateOfBirth: z.string(),
  gender: z.enum(["MALE", "FEMALE"]),
  classId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  notes: z.string().optional(),
});

export type LeaderStudentFormData = z.infer<typeof studentSchema>;

// Helper: Get leader's unit ID
async function getLeaderUnit(userId: string) {
  const leader = await db.youthLeader.findUnique({
    where: { userId },
    select: { unitId: true },
  });
  if (!leader) throw new Error("Leader profile not found");
  return leader.unitId;
}

// Get students in leader's unit
export async function getLeaderStudents(userId: string) {
  const unitId = await getLeaderUnit(userId);

  return db.student.findMany({
    where: { unitId },
    include: {
      class: true,
      parents: {
        include: { parent: { select: { name: true, email: true } } },
      },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

// Get classes in leader's unit (for dropdown)
export async function getLeaderClasses(userId: string) {
  const unitId = await getLeaderUnit(userId);

  return db.class.findMany({
    where: { unitId },
    orderBy: { name: "asc" },
  });
}

// Create student in leader's unit
export async function createStudentAsLeader(
  userId: string,
  data: LeaderStudentFormData
) {
  const unitId = await getLeaderUnit(userId);
  const validated = studentSchema.parse(data);

  // Verify classId belongs to unit (if provided)
  if (validated.classId) {
    const cls = await db.class.findFirst({
      where: { id: validated.classId, unitId },
    });
    if (!cls) throw new Error("Invalid class for this unit");
  }

  const student = await db.student.create({
    data: {
      name: validated.name,
      dharmaName: validated.dharmaName || null,
      dateOfBirth: new Date(validated.dateOfBirth),
      gender: validated.gender,
      unitId, // Always leader's unit
      classId: validated.classId || null,
      status: validated.status,
      notes: validated.notes || null,
    },
  });

  revalidatePath("/leader/students");
  return { success: true, student };
}

// Update student (verify in leader's unit)
export async function updateStudentAsLeader(
  userId: string,
  studentId: string,
  data: LeaderStudentFormData
) {
  const unitId = await getLeaderUnit(userId);
  const validated = studentSchema.parse(data);

  // Verify student belongs to leader's unit
  const existing = await db.student.findUnique({
    where: { id: studentId },
    select: { unitId: true },
  });
  if (!existing || existing.unitId !== unitId) {
    throw new Error("Student not in your unit");
  }

  // Verify classId belongs to unit (if provided)
  if (validated.classId) {
    const cls = await db.class.findFirst({
      where: { id: validated.classId, unitId },
    });
    if (!cls) throw new Error("Invalid class for this unit");
  }

  const student = await db.student.update({
    where: { id: studentId },
    data: {
      name: validated.name,
      dharmaName: validated.dharmaName || null,
      dateOfBirth: new Date(validated.dateOfBirth),
      gender: validated.gender,
      classId: validated.classId || null,
      status: validated.status,
      notes: validated.notes || null,
      // Note: unitId cannot be changed by leader
    },
  });

  revalidatePath("/leader/students");
  return { success: true, student };
}

// Deactivate student (NOT delete - set status=INACTIVE)
export async function deactivateStudentAsLeader(
  userId: string,
  studentId: string
) {
  const unitId = await getLeaderUnit(userId);

  // Verify student belongs to leader's unit
  const existing = await db.student.findUnique({
    where: { id: studentId },
    select: { unitId: true },
  });
  if (!existing || existing.unitId !== unitId) {
    throw new Error("Student not in your unit");
  }

  const student = await db.student.update({
    where: { id: studentId },
    data: { status: "INACTIVE" },
  });

  revalidatePath("/leader/students");
  return { success: true, student };
}
