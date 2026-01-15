"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";
import { Role } from "@prisma/client";

const announcementSchema = z.object({
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
  isPublished: z.boolean().default(false),
  targetRoles: z.array(z.enum(["ADMIN", "LEADER", "PARENT"])).default(["ADMIN", "LEADER", "PARENT"]),
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;

export async function getAnnouncements() {
  return db.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getAnnouncement(id: string) {
  return db.announcement.findUnique({
    where: { id },
  });
}

export async function createAnnouncement(authorId: string, data: AnnouncementFormData) {
  const validated = announcementSchema.parse(data);

  const announcement = await db.announcement.create({
    data: {
      title: validated.title,
      content: validated.content,
      isPublished: validated.isPublished,
      publishedAt: validated.isPublished ? new Date() : null,
      targetRoles: validated.targetRoles as Role[],
      authorId,
    },
  });

  revalidatePath("/admin/announcements");
  return { success: true, announcement };
}

export async function updateAnnouncement(id: string, data: AnnouncementFormData) {
  const validated = announcementSchema.parse(data);

  const existing = await db.announcement.findUnique({ where: { id } });
  const wasPublished = existing?.isPublished;
  const nowPublished = validated.isPublished;

  const announcement = await db.announcement.update({
    where: { id },
    data: {
      title: validated.title,
      content: validated.content,
      isPublished: validated.isPublished,
      publishedAt: !wasPublished && nowPublished ? new Date() : existing?.publishedAt,
      targetRoles: validated.targetRoles as Role[],
    },
  });

  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${id}`);
  return { success: true, announcement };
}

export async function deleteAnnouncement(id: string) {
  await db.announcement.delete({
    where: { id },
  });

  revalidatePath("/admin/announcements");
  return { success: true };
}
