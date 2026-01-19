"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for profile update (leaders can only update certain fields)
const profileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  dharmaName: z.string().optional(),
  yearOfBirth: z.number().min(1900).max(new Date().getFullYear()),
  fullDateOfBirth: z.string().optional(),
  placeOfOrigin: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gdptJoinDate: z.string().optional(),
  quyYDate: z.string().optional(),
  quyYName: z.string().optional(),
  notes: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Get current user's leader profile
export async function getMyProfile(userId: string) {
  const profile = await db.youthLeader.findUnique({
    where: { userId },
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

  return profile;
}

// Update current user's own profile
export async function updateMyProfile(userId: string, data: ProfileFormData) {
  const validated = profileSchema.parse(data);

  // First verify this is the user's own profile
  const profile = await db.youthLeader.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Leader profile not found");
  }

  const updated = await db.youthLeader.update({
    where: { userId },
    data: {
      name: validated.name,
      dharmaName: validated.dharmaName || null,
      yearOfBirth: validated.yearOfBirth,
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
      notes: validated.notes || null,
    },
  });

  // Also update user name
  await db.user.update({
    where: { id: userId },
    data: { name: validated.name },
  });

  revalidatePath("/leader/profile");
  return { success: true, profile: updated };
}

// Timeline actions for own profile
const timelineSchema = z.object({
  role: z.string().min(1, "Vui lòng nhập vai trò"),
  unitId: z.string().min(1, "Vui lòng chọn đơn vị"),
  startYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  endYear: z.number().optional().nullable(),
  notes: z.string().optional(),
});

export type TimelineFormData = z.infer<typeof timelineSchema>;

export async function addMyTimelineEntry(userId: string, data: TimelineFormData) {
  const validated = timelineSchema.parse(data);

  // Get leader profile
  const profile = await db.youthLeader.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Leader profile not found");
  }

  await db.leaderTimeline.create({
    data: {
      leaderId: profile.id,
      role: validated.role,
      unitId: validated.unitId,
      startYear: validated.startYear,
      endYear: validated.endYear || null,
      notes: validated.notes || null,
    },
  });

  revalidatePath("/leader/profile");
  return { success: true };
}

export async function deleteMyTimelineEntry(userId: string, entryId: string) {
  // Verify ownership
  const profile = await db.youthLeader.findUnique({
    where: { userId },
    include: { timeline: { where: { id: entryId } } },
  });

  if (!profile || profile.timeline.length === 0) {
    throw new Error("Timeline entry not found or not owned by user");
  }

  await db.leaderTimeline.delete({
    where: { id: entryId },
  });

  revalidatePath("/leader/profile");
  return { success: true };
}

// Training records actions for own profile
const trainingSchema = z.object({
  campName: z.string().min(1, "Vui lòng nhập tên trại"),
  year: z.number().min(1900).max(new Date().getFullYear()),
  region: z.string().optional(),
  level: z.string().min(1, "Vui lòng nhập bậc"),
  notes: z.string().optional(),
});

export type TrainingFormData = z.infer<typeof trainingSchema>;

export async function addMyTrainingRecord(userId: string, data: TrainingFormData) {
  const validated = trainingSchema.parse(data);

  // Get leader profile
  const profile = await db.youthLeader.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Leader profile not found");
  }

  await db.trainingRecord.create({
    data: {
      leaderId: profile.id,
      campName: validated.campName,
      year: validated.year,
      region: validated.region || null,
      level: validated.level,
      notes: validated.notes || null,
    },
  });

  revalidatePath("/leader/profile");
  return { success: true };
}

export async function deleteMyTrainingRecord(userId: string, recordId: string) {
  // Verify ownership
  const profile = await db.youthLeader.findUnique({
    where: { userId },
    include: { trainingRecords: { where: { id: recordId } } },
  });

  if (!profile || profile.trainingRecords.length === 0) {
    throw new Error("Training record not found or not owned by user");
  }

  await db.trainingRecord.delete({
    where: { id: recordId },
  });

  revalidatePath("/leader/profile");
  return { success: true };
}
