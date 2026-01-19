"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  isPublic: z.boolean(),
});

export type LeaderEventFormData = z.infer<typeof eventSchema>;

// Get leader's unit ID and profile
async function getLeaderProfile(userId: string) {
  const leader = await db.youthLeader.findUnique({
    where: { userId },
    select: { unitId: true, id: true },
  });
  if (!leader) throw new Error("Leader profile not found");
  return leader;
}

// Create event (associated with leader's unit)
export async function createEventAsLeader(
  userId: string,
  data: LeaderEventFormData
) {
  const leader = await getLeaderProfile(userId);
  const validated = eventSchema.parse(data);

  const event = await db.event.create({
    data: {
      title: validated.title,
      description: validated.description || null,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      location: validated.location || null,
      isPublic: validated.isPublic,
      targetRoles: ["ADMIN", "LEADER", "PARENT"],
      unitId: leader.unitId, // Scope to leader's unit
      createdBy: userId, // Track creator
    },
  });

  revalidatePath("/leader/events");
  revalidatePath("/leader/calendar");
  return { success: true, event };
}

// Get events for leader (their unit's events + global events)
export async function getLeaderEvents(userId: string) {
  const leader = await getLeaderProfile(userId);

  return db.event.findMany({
    where: {
      OR: [
        { unitId: leader.unitId }, // Unit-specific events
        { unitId: null, isPublic: true }, // Global public events
      ],
    },
    orderBy: { startDate: "desc" },
  });
}

// Update event (only if createdBy matches)
export async function updateEventAsLeader(
  userId: string,
  eventId: string,
  data: LeaderEventFormData
) {
  const validated = eventSchema.parse(data);

  // Verify event was created by this leader
  const existing = await db.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  });

  if (!existing || existing.createdBy !== userId) {
    throw new Error("Cannot edit events you did not create");
  }

  const event = await db.event.update({
    where: { id: eventId },
    data: {
      title: validated.title,
      description: validated.description || null,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      location: validated.location || null,
      isPublic: validated.isPublic,
    },
  });

  revalidatePath("/leader/events");
  revalidatePath("/leader/calendar");
  return { success: true, event };
}

// Delete event (only if createdBy matches)
export async function deleteEventAsLeader(userId: string, eventId: string) {
  // Verify event was created by this leader
  const existing = await db.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  });

  if (!existing || existing.createdBy !== userId) {
    throw new Error("Cannot delete events you did not create");
  }

  await db.event.delete({ where: { id: eventId } });

  revalidatePath("/leader/events");
  revalidatePath("/leader/calendar");
  return { success: true };
}
