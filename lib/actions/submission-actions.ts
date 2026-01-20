"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";
import { createNotification, createNotificationsForRoles } from "./notification-actions";

const submissionSchema = z.object({
  name: z.string().min(2),
  dharmaName: z.string().optional(),
  dateOfBirth: z.string(),
  gender: z.enum(["MALE", "FEMALE"]),
  unitId: z.string().min(1),
  classId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;

// Parent: Create submission
export async function createStudentSubmission(
  parentId: string,
  data: SubmissionFormData,
  submissionNotes?: string
) {
  const validated = submissionSchema.parse(data);

  const submission = await db.studentSubmission.create({
    data: {
      parentId,
      submittedData: validated,
      submissionNotes: submissionNotes || null,
    },
  });

  // Get parent name for notification
  const parent = await db.user.findUnique({
    where: { id: parentId },
    select: { name: true },
  });

  // Notify all admins about new registration
  await createNotificationsForRoles(
    ["ADMIN"],
    "REGISTRATION_SUBMITTED",
    "New Student Registration",
    `${parent?.name || "A parent"} submitted a registration for ${validated.name}`,
    { submissionId: submission.id, childName: validated.name },
    "/admin/submissions"
  );

  revalidatePath("/parent/children/submissions");
  return { success: true, submission };
}

// Parent: Get my submissions
export async function getMySubmissions(parentId: string) {
  return db.studentSubmission.findMany({
    where: { parentId },
    include: { reviewer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// Parent: Resubmit rejected submission
export async function resubmitStudentSubmission(
  submissionId: string,
  data: SubmissionFormData,
  notes?: string
) {
  const validated = submissionSchema.parse(data);

  const submission = await db.studentSubmission.update({
    where: { id: submissionId },
    data: {
      status: "REVISED",
      submittedData: validated,
      submissionNotes: notes || null,
      reviewNotes: null, // Clear previous review notes
    },
  });

  revalidatePath("/parent/children/submissions");
  return { success: true, submission };
}

// Admin: Get pending submissions
export async function getPendingSubmissions() {
  return db.studentSubmission.findMany({
    where: { status: "PENDING" },
    include: { parent: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" }, // FIFO
  });
}

// Admin: Get all submissions (with filters)
export async function getSubmissions(status?: string) {
  return db.studentSubmission.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      parent: { select: { id: true, name: true, email: true } },
      reviewer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Admin: Approve submission
export async function approveSubmission(
  submissionId: string,
  reviewerId: string
) {
  const submission = await db.studentSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission || (submission.status !== "PENDING" && submission.status !== "REVISED")) {
    throw new Error("Invalid submission");
  }

  const data = submission.submittedData as SubmissionFormData;

  // Transaction: create student + link + update submission
  await db.$transaction(async (tx) => {
    // Create student
    const student = await tx.student.create({
      data: {
        name: data.name,
        dharmaName: data.dharmaName || null,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        unitId: data.unitId,
        classId: data.classId || null,
        notes: data.notes || null,
      },
    });

    // Create parent-student link
    await tx.parentStudent.create({
      data: {
        parentId: submission.parentId,
        studentId: student.id,
        relation: "Parent",
      },
    });

    // Update submission status
    await tx.studentSubmission.update({
      where: { id: submissionId },
      data: {
        status: "APPROVED",
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });
  });

  // Notify parent that registration was approved
  await createNotification(
    submission.parentId,
    "REGISTRATION_APPROVED",
    "Registration Approved",
    `Registration for ${data.name} has been approved`,
    { submissionId, childName: data.name },
    "/parent/children"
  );

  revalidatePath("/admin/submissions");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/students");
  revalidatePath("/parent/children");
  return { success: true };
}

// Admin: Reject submission
export async function rejectSubmission(
  submissionId: string,
  reviewerId: string,
  reviewNotes: string
) {
  const submission = await db.studentSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const data = submission.submittedData as SubmissionFormData;

  await db.studentSubmission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      reviewedBy: reviewerId,
      reviewNotes,
      reviewedAt: new Date(),
    },
  });

  // Notify parent that registration was rejected
  await createNotification(
    submission.parentId,
    "REGISTRATION_REJECTED",
    "Registration Rejected",
    `Registration for ${data.name} has been rejected. Please review the feedback and resubmit.`,
    { submissionId, childName: data.name, reason: reviewNotes },
    "/parent/children/submissions"
  );

  revalidatePath("/admin/submissions");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
