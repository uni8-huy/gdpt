"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Gender, Status } from "@prisma/client";

export type ImportResult = {
  success: boolean;
  imported: number;
  errors: string[];
  skipped: number;
};

type StudentImportRow = {
  name: string;
  dharmaName?: string;
  dateOfBirth: string;
  gender: string;
  unitName: string;
  className?: string;
  status?: string;
  notes?: string;
};

type LeaderImportRow = {
  name: string;
  dharmaName?: string;
  yearOfBirth: string;
  unitName: string;
  level?: string;
  status?: string;
  phone?: string;
  email?: string;
  placeOfOrigin?: string;
  education?: string;
  occupation?: string;
  notes?: string;
};

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Try different date formats
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY or D/M/YYYY
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0] || format === formats[2]) {
        // DD/MM/YYYY or DD-MM-YYYY
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        return new Date(year, month, day);
      } else {
        // YYYY-MM-DD
        return new Date(dateStr);
      }
    }
  }
  return null;
}

function parseGender(genderStr: string): Gender | null {
  const normalized = genderStr.toLowerCase().trim();
  if (normalized === "nam" || normalized === "male" || normalized === "m") {
    return "MALE";
  }
  if (normalized === "nữ" || normalized === "nu" || normalized === "female" || normalized === "f") {
    return "FEMALE";
  }
  return null;
}

function parseStatus(statusStr: string | undefined): Status {
  if (!statusStr) return "ACTIVE";
  const normalized = statusStr.toLowerCase().trim();
  if (
    normalized === "nghỉ" ||
    normalized === "nghi" ||
    normalized === "inactive" ||
    normalized === "0"
  ) {
    return "INACTIVE";
  }
  return "ACTIVE";
}

export async function importStudents(data: StudentImportRow[]): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  // Get all units for lookup
  const units = await db.unit.findMany({
    select: { id: true, name: true },
  });
  const unitMap = new Map(units.map((u) => [u.name.toLowerCase(), u.id]));

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // +2 for header and 0-index

    try {
      // Validate required fields
      if (!row.name?.trim()) {
        errors.push(`Dòng ${rowNum}: Thiếu tên`);
        skipped++;
        continue;
      }

      const dateOfBirth = parseDate(row.dateOfBirth);
      if (!dateOfBirth) {
        errors.push(`Dòng ${rowNum}: Ngày sinh không hợp lệ "${row.dateOfBirth}"`);
        skipped++;
        continue;
      }

      const gender = parseGender(row.gender);
      if (!gender) {
        errors.push(`Dòng ${rowNum}: Giới tính không hợp lệ "${row.gender}"`);
        skipped++;
        continue;
      }

      const unitId = unitMap.get(row.unitName?.toLowerCase().trim());
      if (!unitId) {
        errors.push(`Dòng ${rowNum}: Đơn vị không tồn tại "${row.unitName}"`);
        skipped++;
        continue;
      }

      // Create student
      await db.student.create({
        data: {
          name: row.name.trim(),
          dharmaName: row.dharmaName?.trim() || null,
          dateOfBirth,
          gender,
          unitId,
          className: row.className?.trim() || null,
          status: parseStatus(row.status),
          notes: row.notes?.trim() || null,
        },
      });

      imported++;
    } catch (error) {
      errors.push(`Dòng ${rowNum}: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
      skipped++;
    }
  }

  revalidatePath("/admin/students");
  return { success: errors.length === 0, imported, errors, skipped };
}

export async function importLeaders(
  data: LeaderImportRow[],
  createUsers: boolean = false
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  // Get all units for lookup
  const units = await db.unit.findMany({
    select: { id: true, name: true },
  });
  const unitMap = new Map(units.map((u) => [u.name.toLowerCase(), u.id]));

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2;

    try {
      // Validate required fields
      if (!row.name?.trim()) {
        errors.push(`Dòng ${rowNum}: Thiếu tên`);
        skipped++;
        continue;
      }

      const yearOfBirth = parseInt(row.yearOfBirth, 10);
      if (isNaN(yearOfBirth) || yearOfBirth < 1900 || yearOfBirth > new Date().getFullYear()) {
        errors.push(`Dòng ${rowNum}: Năm sinh không hợp lệ "${row.yearOfBirth}"`);
        skipped++;
        continue;
      }

      const unitId = unitMap.get(row.unitName?.toLowerCase().trim());
      if (!unitId) {
        errors.push(`Dòng ${rowNum}: Đơn vị không tồn tại "${row.unitName}"`);
        skipped++;
        continue;
      }

      // Create user if email provided and createUsers is true
      let userId: string | null = null;
      if (row.email && createUsers) {
        const existingUser = await db.user.findUnique({
          where: { email: row.email.trim().toLowerCase() },
        });

        if (existingUser) {
          // Check if user already has a leader profile
          const existingLeader = await db.youthLeader.findUnique({
            where: { userId: existingUser.id },
          });
          if (existingLeader) {
            errors.push(`Dòng ${rowNum}: Email đã có hồ sơ huynh trưởng "${row.email}"`);
            skipped++;
            continue;
          }
          userId = existingUser.id;
        } else {
          // Create new user
          const newUser = await db.user.create({
            data: {
              email: row.email.trim().toLowerCase(),
              name: row.name.trim(),
              role: "LEADER",
            },
          });
          userId = newUser.id;
        }
      }

      if (!userId) {
        // Create a placeholder user if no email
        const placeholderEmail = `leader-${Date.now()}-${i}@placeholder.local`;
        const newUser = await db.user.create({
          data: {
            email: placeholderEmail,
            name: row.name.trim(),
            role: "LEADER",
          },
        });
        userId = newUser.id;
      }

      // Create leader profile
      await db.youthLeader.create({
        data: {
          userId,
          name: row.name.trim(),
          dharmaName: row.dharmaName?.trim() || null,
          yearOfBirth,
          unitId,
          level: row.level?.trim() || null,
          status: parseStatus(row.status),
          phone: row.phone?.trim() || null,
          placeOfOrigin: row.placeOfOrigin?.trim() || null,
          education: row.education?.trim() || null,
          occupation: row.occupation?.trim() || null,
          notes: row.notes?.trim() || null,
        },
      });

      imported++;
    } catch (error) {
      errors.push(`Dòng ${rowNum}: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
      skipped++;
    }
  }

  revalidatePath("/admin/leaders");
  return { success: errors.length === 0, imported, errors, skipped };
}

export async function getImportTemplate(type: "students" | "leaders"): Promise<string> {
  if (type === "students") {
    return `name,dharmaName,dateOfBirth,gender,unitName,className,status,notes
Nguyễn Văn A,Tâm An,15/06/2010,Nam,Đơn vị A,Oanh Vũ,Đang sinh hoạt,Ghi chú
Trần Thị B,,20/03/2012,Nữ,Đơn vị B,Thiếu Nam,,`;
  }

  return `name,dharmaName,yearOfBirth,unitName,level,status,phone,email,placeOfOrigin,education,occupation,notes
Nguyễn Văn C,Tâm Đức,1990,Đơn vị A,Tín,Đang hoạt động,0901234567,example@email.com,TP.HCM,Đại học,Giáo viên,Ghi chú`;
}
