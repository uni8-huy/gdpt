"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// Get all parents (users with PARENT role)
export async function getParents() {
  return db.user.findMany({
    where: { role: "PARENT" },
    orderBy: { name: "asc" },
  });
}

// Get students with their parent links
export async function getStudentsWithParents() {
  return db.student.findMany({
    include: {
      unit: true,
      parents: {
        include: {
          parent: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

// Get parent with linked students
export async function getParentWithStudents(parentId: string) {
  return db.user.findUnique({
    where: { id: parentId },
    include: {
      parentLinks: {
        include: {
          student: { include: { unit: true } },
        },
      },
    },
  });
}

// Link parent to student
export async function linkParentToStudent(
  parentId: string,
  studentId: string,
  relation: string = "Parent"
) {
  // Check if link already exists
  const existing = await db.parentStudent.findUnique({
    where: { parentId_studentId: { parentId, studentId } },
  });

  if (existing) {
    return { success: false, error: "Link already exists" };
  }

  await db.parentStudent.create({
    data: { parentId, studentId, relation },
  });

  revalidatePath("/admin/parents");
  revalidatePath("/admin/students");
  return { success: true };
}

// Unlink parent from student
export async function unlinkParentFromStudent(
  parentId: string,
  studentId: string
) {
  await db.parentStudent.delete({
    where: { parentId_studentId: { parentId, studentId } },
  });

  revalidatePath("/admin/parents");
  revalidatePath("/admin/students");
  return { success: true };
}

// Get all users (for creating parent accounts or linking)
export async function getUsers() {
  return db.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
}

// Update user role to PARENT
export async function setUserAsParent(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { role: "PARENT" },
  });

  revalidatePath("/admin/parents");
  return { success: true };
}
