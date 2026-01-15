"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";
import { Role } from "@prisma/client";

const eventSchema = z.object({
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  isPublic: z.boolean().default(true),
  targetRoles: z.array(z.enum(["ADMIN", "LEADER", "PARENT"])).default(["ADMIN", "LEADER", "PARENT"]),
});

export type EventFormData = z.infer<typeof eventSchema>;

export async function getEvents() {
  return db.event.findMany({
    orderBy: { startDate: "desc" },
  });
}

export async function getEvent(id: string) {
  return db.event.findUnique({
    where: { id },
  });
}

export async function createEvent(data: EventFormData) {
  const validated = eventSchema.parse(data);

  const event = await db.event.create({
    data: {
      title: validated.title,
      description: validated.description || null,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      location: validated.location || null,
      isPublic: validated.isPublic,
      targetRoles: validated.targetRoles as Role[],
    },
  });

  revalidatePath("/admin/events");
  return { success: true, event };
}

export async function updateEvent(id: string, data: EventFormData) {
  const validated = eventSchema.parse(data);

  const event = await db.event.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description || null,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      location: validated.location || null,
      isPublic: validated.isPublic,
      targetRoles: validated.targetRoles as Role[],
    },
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  return { success: true, event };
}

export async function deleteEvent(id: string) {
  await db.event.delete({
    where: { id },
  });

  revalidatePath("/admin/events");
  return { success: true };
}
