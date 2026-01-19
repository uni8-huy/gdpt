"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { hashPassword, generateRandomPassword } from "@/lib/auth/password-utils";

export type UserWithRelations = {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  createdAt: Date;
  leaderProfile: {
    id: string;
    userId: string;
    name: string;
    dharmaName: string | null;
    yearOfBirth: number;
    unitId: string;
    status: "ACTIVE" | "INACTIVE";
    fullDateOfBirth: Date | null;
    placeOfOrigin: string | null;
    education: string | null;
    occupation: string | null;
    phone: string | null;
    address: string | null;
    gdptJoinDate: Date | null;
    quyYDate: Date | null;
    quyYName: string | null;
    level: string | null;
    notes: string | null;
    unit: { id: string; name: string };
    timeline: Array<{
      id: string;
      role: string;
      unit: { id: string; name: string };
      startYear: number;
      endYear: number | null;
      notes: string | null;
    }>;
    trainingRecords: Array<{
      id: string;
      campName: string;
      year: number;
      region: string | null;
      level: string;
      notes: string | null;
    }>;
  } | null;
  parentLinks: { student: { id: string; name: string } }[];
};

export async function getUsers(filters?: { role?: Role; search?: string }) {
  const where: { role?: Role; OR?: { name?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" } }[] } = {};

  if (filters?.role) {
    where.role = filters.role;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return db.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      leaderProfile: {
        select: {
          id: true,
          userId: true,
          name: true,
          dharmaName: true,
          yearOfBirth: true,
          unitId: true,
          status: true,
          fullDateOfBirth: true,
          placeOfOrigin: true,
          education: true,
          occupation: true,
          phone: true,
          address: true,
          gdptJoinDate: true,
          quyYDate: true,
          quyYName: true,
          level: true,
          notes: true,
          unit: { select: { id: true, name: true } },
          timeline: {
            select: {
              id: true,
              role: true,
              unit: { select: { id: true, name: true } },
              startYear: true,
              endYear: true,
              notes: true,
            },
            orderBy: { startYear: "desc" },
          },
          trainingRecords: {
            select: {
              id: true,
              campName: true,
              year: true,
              region: true,
              level: true,
              notes: true,
            },
            orderBy: { year: "desc" },
          },
        },
      },
      parentLinks: {
        select: {
          student: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUser(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      leaderProfile: {
        include: {
          unit: true,
          timeline: {
            include: { unit: true },
            orderBy: { startYear: "desc" },
          },
          trainingRecords: {
            orderBy: { year: "desc" },
          },
        },
      },
      parentLinks: {
        include: { student: true },
      },
    },
  });
}

export async function updateUserRole(
  userId: string,
  newRole: Role,
  currentUserId: string
) {
  // Cannot change own role
  if (userId === currentUserId) {
    throw new Error("Cannot change your own role");
  }

  // Check if this is the last admin
  if (newRole !== "ADMIN") {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user?.role === "ADMIN") {
      const adminCount = await db.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        throw new Error("Cannot demote the last admin");
      }
    }
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin/users");
  return { success: true, user: updatedUser };
}

export async function resetUserPassword(userId: string) {
  const tempPassword = generateRandomPassword();
  const hashedPassword = await hashPassword(tempPassword);

  // Update or create credential account with new password
  await db.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: userId,
      },
    },
    update: {
      password: hashedPassword,
    },
    create: {
      userId,
      providerId: "credential",
      accountId: userId,
      password: hashedPassword,
    },
  });

  // Set flag to force password change on next login
  await db.user.update({
    where: { id: userId },
    data: { forcePasswordChange: true },
  });

  revalidatePath("/admin/users");
  return { success: true, tempPassword };
}

export async function deleteUser(userId: string, currentUserId: string) {
  // Cannot delete self
  if (userId === currentUserId) {
    throw new Error("Cannot delete your own account");
  }

  // Check if this is the last admin
  const user = await db.user.findUnique({ where: { id: userId } });
  if (user?.role === "ADMIN") {
    const adminCount = await db.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("Cannot delete the last admin");
    }
  }

  // Delete related records first
  await db.parentStudent.deleteMany({ where: { parentId: userId } });
  await db.youthLeader.deleteMany({ where: { userId } });
  await db.session.deleteMany({ where: { userId } });
  await db.account.deleteMany({ where: { userId } });

  // Delete user
  await db.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getAdminCount() {
  return db.user.count({ where: { role: "ADMIN" } });
}

export type CreateUserData = {
  name: string;
  email: string;
};

export async function createUser(data: CreateUserData) {
  // Check if email already exists
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Generate temporary password
  const tempPassword = generateRandomPassword();
  const hashedPassword = await hashPassword(tempPassword);

  // Create user with PARENT role by default
  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: "PARENT",
      emailVerified: true,
      forcePasswordChange: true,
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

  revalidatePath("/admin/users");
  return { success: true, user, tempPassword };
}

export type UpdateUserData = {
  name: string;
  email: string;
};

export async function updateUser(userId: string, data: UpdateUserData) {
  // Check if email is being changed and if it already exists
  const existingUser = await db.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new Error("User not found");
  }

  // If email is changing, check for duplicates
  if (data.email !== existingUser.email) {
    const emailExists = await db.user.findUnique({
      where: { email: data.email },
    });
    if (emailExists) {
      throw new Error("Email already exists");
    }
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
    },
  });

  revalidatePath("/admin/users");
  return { success: true, user: updatedUser };
}

// Leader Profile Actions
export type LeaderProfileData = {
  name: string;
  dharmaName?: string;
  yearOfBirth: number;
  unitId: string;
  status?: "ACTIVE" | "INACTIVE";
  fullDateOfBirth?: string;
  placeOfOrigin?: string;
  education?: string;
  occupation?: string;
  phone?: string;
  address?: string;
  gdptJoinDate?: string;
  quyYDate?: string;
  quyYName?: string;
  level?: string;
  notes?: string;
};

export async function createLeaderProfile(userId: string, data: LeaderProfileData) {
  const leader = await db.youthLeader.create({
    data: {
      userId,
      name: data.name,
      dharmaName: data.dharmaName || null,
      yearOfBirth: data.yearOfBirth,
      unitId: data.unitId,
      status: data.status || "ACTIVE",
      fullDateOfBirth: data.fullDateOfBirth ? new Date(data.fullDateOfBirth) : null,
      placeOfOrigin: data.placeOfOrigin || null,
      education: data.education || null,
      occupation: data.occupation || null,
      phone: data.phone || null,
      address: data.address || null,
      gdptJoinDate: data.gdptJoinDate ? new Date(data.gdptJoinDate) : null,
      quyYDate: data.quyYDate ? new Date(data.quyYDate) : null,
      quyYName: data.quyYName || null,
      level: data.level || null,
      notes: data.notes || null,
    },
  });

  // Update user role to LEADER
  await db.user.update({
    where: { id: userId },
    data: { role: "LEADER" },
  });

  revalidatePath("/admin/users");
  return { success: true, leader };
}

export async function updateLeaderProfile(leaderId: string, data: LeaderProfileData) {
  const leader = await db.youthLeader.update({
    where: { id: leaderId },
    data: {
      name: data.name,
      dharmaName: data.dharmaName || null,
      yearOfBirth: data.yearOfBirth,
      unitId: data.unitId,
      status: data.status || "ACTIVE",
      fullDateOfBirth: data.fullDateOfBirth ? new Date(data.fullDateOfBirth) : null,
      placeOfOrigin: data.placeOfOrigin || null,
      education: data.education || null,
      occupation: data.occupation || null,
      phone: data.phone || null,
      address: data.address || null,
      gdptJoinDate: data.gdptJoinDate ? new Date(data.gdptJoinDate) : null,
      quyYDate: data.quyYDate ? new Date(data.quyYDate) : null,
      quyYName: data.quyYName || null,
      level: data.level || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/admin/users");
  return { success: true, leader };
}

export async function deleteLeaderProfile(leaderId: string) {
  const leader = await db.youthLeader.findUnique({
    where: { id: leaderId },
    select: { userId: true },
  });

  if (!leader) {
    throw new Error("Leader profile not found");
  }

  // Delete the leader profile
  await db.youthLeader.delete({
    where: { id: leaderId },
  });

  // Update user role back to PARENT
  await db.user.update({
    where: { id: leader.userId },
    data: { role: "PARENT" },
  });

  revalidatePath("/admin/users");
  return { success: true };
}
