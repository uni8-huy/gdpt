"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";
import { Role } from "@prisma/client";
import { createNotificationsForRoles } from "./notification-actions";

const announcementSchema = z.object({
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
  isPublished: z.boolean().default(false),
  isPublic: z.boolean().default(false), // Display on public landing page
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
      isPublic: validated.isPublic,
      publishedAt: validated.isPublished ? new Date() : null,
      targetRoles: validated.targetRoles as Role[],
      authorId,
    },
  });

  // Notify target roles if announcement is published
  if (validated.isPublished && validated.targetRoles.length > 0) {
    await createNotificationsForRoles(
      validated.targetRoles as Role[],
      "ANNOUNCEMENT_PUBLISHED",
      "New Announcement",
      `New announcement: ${validated.title}`,
      { announcementId: announcement.id, title: validated.title },
      "/parent/announcements"
    );
  }

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
      isPublic: validated.isPublic,
      publishedAt: !wasPublished && nowPublished ? new Date() : existing?.publishedAt,
      targetRoles: validated.targetRoles as Role[],
    },
  });

  // Notify target roles if announcement was just published
  if (!wasPublished && nowPublished && validated.targetRoles.length > 0) {
    await createNotificationsForRoles(
      validated.targetRoles as Role[],
      "ANNOUNCEMENT_PUBLISHED",
      "New Announcement",
      `New announcement: ${validated.title}`,
      { announcementId: announcement.id, title: validated.title },
      "/parent/announcements"
    );
  }

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
