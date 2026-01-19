"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password-utils";
import crypto from "crypto";

const TOKEN_EXPIRY_DAYS = 7;

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createInvitation(data: {
  email: string;
  name?: string;
  role: Role;
  unitId?: string;
  createdBy: string;
}) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  // Check if invitation already exists for this email
  const existing = await db.invitation.findFirst({
    where: {
      email: data.email,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (existing) {
    throw new Error("An active invitation already exists for this email");
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const invitation = await db.invitation.create({
    data: {
      email: data.email,
      name: data.name || null,
      role: data.role,
      token,
      unitId: data.unitId || null,
      expiresAt,
      createdBy: data.createdBy,
    },
    include: {
      unit: { select: { name: true } },
    },
  });

  revalidatePath("/admin/users");
  return { success: true, invitation, token };
}

export async function getInvitations() {
  return db.invitation.findMany({
    include: {
      unit: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvitationByToken(token: string) {
  const invitation = await db.invitation.findUnique({
    where: { token },
    include: {
      unit: { select: { id: true, name: true } },
    },
  });

  if (!invitation) {
    return null;
  }

  const isExpired = invitation.expiresAt < new Date();
  const isUsed = invitation.usedAt !== null;

  return { ...invitation, isExpired, isUsed };
}

export async function acceptInvitation(
  token: string,
  userData: { name: string; password: string }
) {
  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { unit: true },
  });

  if (!invitation) {
    throw new Error("Invalid invitation token");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Invitation has expired");
  }

  if (invitation.usedAt) {
    throw new Error("Invitation has already been used");
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email: invitation.email },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  // Create user
  const hashedPassword = await hashPassword(userData.password);

  const user = await db.user.create({
    data: {
      email: invitation.email,
      name: userData.name,
      role: invitation.role,
    },
  });

  // Create credential account
  await db.account.create({
    data: {
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hashedPassword,
    },
  });

  // If role is LEADER and unit is specified, create leader profile
  if (invitation.role === "LEADER" && invitation.unitId) {
    await db.youthLeader.create({
      data: {
        userId: user.id,
        name: userData.name,
        yearOfBirth: new Date().getFullYear() - 25, // Default placeholder
        unitId: invitation.unitId,
      },
    });
  }

  // Mark invitation as used
  await db.invitation.update({
    where: { id: invitation.id },
    data: { usedAt: new Date() },
  });

  revalidatePath("/admin/users");
  return { success: true, user };
}

export async function cancelInvitation(id: string) {
  await db.invitation.delete({
    where: { id },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function resendInvitation(id: string, createdBy: string) {
  const invitation = await db.invitation.findUnique({
    where: { id },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Generate new token and expiry
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  const updated = await db.invitation.update({
    where: { id },
    data: {
      token,
      expiresAt,
      createdBy,
      usedAt: null, // Reset usedAt in case it was used before
    },
    include: {
      unit: { select: { name: true } },
    },
  });

  revalidatePath("/admin/users");
  return { success: true, invitation: updated, token };
}
