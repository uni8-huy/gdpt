"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

const leaderSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  dharmaName: z.string().optional(),
  yearOfBirth: z.number().min(1900).max(new Date().getFullYear()),
  unitId: z.string().min(1, "Vui lòng chọn đơn vị"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
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

export type LeaderFormData = z.infer<typeof leaderSchema>;

export async function getLeaders() {
  return db.youthLeader.findMany({
    include: {
      unit: true,
      user: { select: { email: true } },
      _count: { select: { timeline: true, trainingRecords: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getLeader(id: string) {
  return db.youthLeader.findUnique({
    where: { id },
    include: {
      unit: true,
      user: { select: { email: true, name: true } },
      timeline: {
        include: { unit: true },
        orderBy: { startYear: "desc" },
      },
      trainingRecords: {
        orderBy: { year: "desc" },
      },
    },
  });
}

export async function createLeader(userId: string, data: LeaderFormData) {
  const validated = leaderSchema.parse(data);

  const leader = await db.youthLeader.create({
    data: {
      userId,
      name: validated.name,
      dharmaName: validated.dharmaName || null,
      yearOfBirth: validated.yearOfBirth,
      unitId: validated.unitId,
      status: validated.status,
      fullDateOfBirth: validated.fullDateOfBirth
        ? new Date(validated.fullDateOfBirth)
        : null,
      placeOfOrigin: validated.placeOfOrigin || null,
      education: validated.education || null,
      occupation: validated.occupation || null,
      phone: validated.phone || null,
      address: validated.address || null,
      gdptJoinDate: validated.gdptJoinDate
        ? new Date(validated.gdptJoinDate)
        : null,
      quyYDate: validated.quyYDate ? new Date(validated.quyYDate) : null,
      quyYName: validated.quyYName || null,
      level: validated.level || null,
      notes: validated.notes || null,
    },
  });

  // Update user role to LEADER
  await db.user.update({
    where: { id: userId },
    data: { role: "LEADER" },
  });

  revalidatePath("/admin/leaders");
  return { success: true, leader };
}

export async function updateLeader(id: string, data: LeaderFormData) {
  const validated = leaderSchema.parse(data);

  const leader = await db.youthLeader.update({
    where: { id },
    data: {
      name: validated.name,
      dharmaName: validated.dharmaName || null,
      yearOfBirth: validated.yearOfBirth,
      unitId: validated.unitId,
      status: validated.status,
      fullDateOfBirth: validated.fullDateOfBirth
        ? new Date(validated.fullDateOfBirth)
        : null,
      placeOfOrigin: validated.placeOfOrigin || null,
      education: validated.education || null,
      occupation: validated.occupation || null,
      phone: validated.phone || null,
      address: validated.address || null,
      gdptJoinDate: validated.gdptJoinDate
        ? new Date(validated.gdptJoinDate)
        : null,
      quyYDate: validated.quyYDate ? new Date(validated.quyYDate) : null,
      quyYName: validated.quyYName || null,
      level: validated.level || null,
      notes: validated.notes || null,
    },
  });

  revalidatePath("/admin/leaders");
  revalidatePath(`/admin/leaders/${id}`);
  return { success: true, leader };
}

export async function deleteLeader(id: string) {
  const leader = await db.youthLeader.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!leader) {
    throw new Error("Huynh trưởng không tồn tại");
  }

  // Delete the leader profile
  await db.youthLeader.delete({
    where: { id },
  });

  // Update user role back to PARENT
  await db.user.update({
    where: { id: leader.userId },
    data: { role: "PARENT" },
  });

  revalidatePath("/admin/leaders");
  return { success: true };
}

// Timeline actions
const timelineSchema = z.object({
  role: z.string().min(1, "Vui lòng nhập vai trò"),
  unitId: z.string().min(1, "Vui lòng chọn đơn vị"),
  startYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  endYear: z.number().optional().nullable(),
  notes: z.string().optional(),
});

export type TimelineFormData = z.infer<typeof timelineSchema>;

export async function addTimelineEntry(leaderId: string, data: TimelineFormData) {
  const validated = timelineSchema.parse(data);

  await db.leaderTimeline.create({
    data: {
      leaderId,
      role: validated.role,
      unitId: validated.unitId,
      startYear: validated.startYear,
      endYear: validated.endYear || null,
      notes: validated.notes || null,
    },
  });

  revalidatePath(`/admin/leaders/${leaderId}`);
  return { success: true };
}

export async function deleteTimelineEntry(id: string, leaderId: string) {
  await db.leaderTimeline.delete({
    where: { id },
  });

  revalidatePath(`/admin/leaders/${leaderId}`);
  return { success: true };
}

// Training records actions
const trainingSchema = z.object({
  campName: z.string().min(1, "Vui lòng nhập tên trại"),
  year: z.number().min(1900).max(new Date().getFullYear()),
  region: z.string().optional(),
  level: z.string().min(1, "Vui lòng nhập bậc"),
  notes: z.string().optional(),
});

export type TrainingFormData = z.infer<typeof trainingSchema>;

export async function addTrainingRecord(leaderId: string, data: TrainingFormData) {
  const validated = trainingSchema.parse(data);

  await db.trainingRecord.create({
    data: {
      leaderId,
      campName: validated.campName,
      year: validated.year,
      region: validated.region || null,
      level: validated.level,
      notes: validated.notes || null,
    },
  });

  revalidatePath(`/admin/leaders/${leaderId}`);
  return { success: true };
}

export async function deleteTrainingRecord(id: string, leaderId: string) {
  await db.trainingRecord.delete({
    where: { id },
  });

  revalidatePath(`/admin/leaders/${leaderId}`);
  return { success: true };
}

// Get users who don't have a leader profile yet
export async function getAvailableUsersForLeader() {
  return db.user.findMany({
    where: {
      leaderProfile: null, // No existing leader profile
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });
}
