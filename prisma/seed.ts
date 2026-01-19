import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create user via Better Auth API (ensures correct password hashing)
async function createUserViaAPI(
  email: string,
  password: string,
  name: string
): Promise<boolean> {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:4004";
  try {
    const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Delete user and related data
async function deleteUserIfExists(email: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.account.deleteMany({ where: { userId: existing.id } });
    await prisma.session.deleteMany({ where: { userId: existing.id } });
    await prisma.youthLeader.deleteMany({ where: { userId: existing.id } });
    await prisma.parentStudent.deleteMany({ where: { parentId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }
}

async function main() {
  console.log("Seeding database...");

  // ==========================================
  // UNITS
  // ==========================================
  const unitNames = ["GĐPT Chánh Giác", "GĐPT Bửu Sơn", "GĐPT Pháp Hoa"];
  const units: { id: string; name: string }[] = [];

  for (const name of unitNames) {
    const unit = await prisma.unit.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    units.push(unit);
  }
  console.log("✅ Created sample units");

  // ==========================================
  // CLASSES (per unit)
  // ==========================================
  const classesData = [
    { name: "Oanh Vũ", unitIndex: 0, description: "Lớp Oanh Vũ (6-12 tuổi)" },
    { name: "Thiếu Nam", unitIndex: 0, description: "Lớp Thiếu Nam (13-17 tuổi)" },
    { name: "Thiếu Nữ", unitIndex: 0, description: "Lớp Thiếu Nữ (13-17 tuổi)" },
    { name: "Oanh Vũ", unitIndex: 1, description: "Lớp Oanh Vũ" },
    { name: "Thiếu Nam", unitIndex: 1, description: "Lớp Thiếu Nam" },
    { name: "Thiếu Nữ", unitIndex: 1, description: "Lớp Thiếu Nữ" },
    { name: "Ngành Thanh", unitIndex: 1, description: "Ngành Thanh (18+ tuổi)" },
    { name: "Oanh Vũ", unitIndex: 2, description: "Lớp Oanh Vũ" },
    { name: "Ngành Thanh", unitIndex: 2, description: "Ngành Thanh" },
  ];

  // Store classes in a map for easy lookup: "unitId-className" -> classId
  const classMap = new Map<string, string>();

  for (const c of classesData) {
    const unitId = units[c.unitIndex].id;
    const cls = await prisma.class.upsert({
      where: { unitId_name: { unitId, name: c.name } },
      update: { description: c.description },
      create: { name: c.name, unitId, description: c.description },
    });
    classMap.set(`${unitId}-${c.name}`, cls.id);
  }
  console.log("✅ Created sample classes");

  // ==========================================
  // MIGRATE EXISTING STUDENTS: className → classId
  // ==========================================
  const existingStudents = await prisma.student.findMany({
    where: { className: { not: null }, classId: null },
    select: { id: true, className: true, unitId: true },
  });

  for (const s of existingStudents) {
    if (s.className) {
      const classId = classMap.get(`${s.unitId}-${s.className}`);
      if (classId) {
        await prisma.student.update({
          where: { id: s.id },
          data: { classId },
        });
      }
    }
  }
  if (existingStudents.length > 0) {
    console.log(`✅ Migrated ${existingStudents.length} students: className → classId`);
  }

  // ==========================================
  // STUDENTS
  // ==========================================
  const studentsData = [
    { name: "Nguyễn Văn An", dharmaName: "Tâm An", gender: "MALE" as const, unitIndex: 0, className: "Oanh Vũ", dob: new Date("2015-03-15") },
    { name: "Trần Thị Bình", dharmaName: "Tâm Bình", gender: "FEMALE" as const, unitIndex: 0, className: "Oanh Vũ", dob: new Date("2014-07-22") },
    { name: "Lê Minh Châu", dharmaName: "Tâm Châu", gender: "MALE" as const, unitIndex: 1, className: "Thiếu Nam", dob: new Date("2010-11-08") },
    { name: "Phạm Hồng Đào", dharmaName: "Tâm Đào", gender: "FEMALE" as const, unitIndex: 1, className: "Thiếu Nữ", dob: new Date("2011-05-30") },
    { name: "Hoàng Gia Huy", dharmaName: "Tâm Huy", gender: "MALE" as const, unitIndex: 2, className: "Ngành Thanh", dob: new Date("2008-09-12") },
    { name: "Võ Kim Liên", dharmaName: "Tâm Liên", gender: "FEMALE" as const, unitIndex: 2, className: "Ngành Thanh", dob: new Date("2007-12-25") },
  ];

  const students: { id: string; name: string }[] = [];
  for (const s of studentsData) {
    const unitId = units[s.unitIndex].id;
    const classId = classMap.get(`${unitId}-${s.className}`);
    const student = await prisma.student.upsert({
      where: { id: `seed-student-${s.name.toLowerCase().replace(/\s/g, "-")}` },
      update: { name: s.name, dharmaName: s.dharmaName, classId },
      create: {
        id: `seed-student-${s.name.toLowerCase().replace(/\s/g, "-")}`,
        name: s.name,
        dharmaName: s.dharmaName,
        dateOfBirth: s.dob,
        gender: s.gender,
        unitId,
        classId,
        className: s.className, // Keep for backward compat
        status: "ACTIVE",
      },
    });
    students.push(student);
  }
  console.log("✅ Created sample students");

  // ==========================================
  // ADMIN USER
  // ==========================================
  const adminEmail = "admin@gdpt.local";
  const adminPassword = "admin123";

  await deleteUserIfExists(adminEmail);

  const adminCreated = await createUserViaAPI(adminEmail, adminPassword, "Quản trị viên");
  if (adminCreated) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "ADMIN", emailVerified: true, forcePasswordChange: true },
    });
    console.log("✅ Created admin user");
  } else {
    console.log("⚠️  Could not create admin (server not running?)");
  }

  // ==========================================
  // PARENT USERS
  // ==========================================
  const parentsData = [
    { email: "parent1@gdpt.local", name: "Nguyễn Văn Tâm", studentIndices: [0] },
    { email: "parent2@gdpt.local", name: "Trần Thị Hương", studentIndices: [1] },
    { email: "parent3@gdpt.local", name: "Lê Văn Minh", studentIndices: [2, 3] }, // Parent with 2 children
    { email: "parent4@gdpt.local", name: "Hoàng Thị Mai", studentIndices: [4] },
  ];
  const parentPassword = "parent123";

  for (const p of parentsData) {
    await deleteUserIfExists(p.email);

    const created = await createUserViaAPI(p.email, parentPassword, p.name);
    if (created) {
      const user = await prisma.user.update({
        where: { email: p.email },
        data: { role: "PARENT", emailVerified: true },
      });

      // Link parent to students
      for (const idx of p.studentIndices) {
        if (students[idx]) {
          await prisma.parentStudent.upsert({
            where: {
              parentId_studentId: {
                parentId: user.id,
                studentId: students[idx].id,
              },
            },
            update: {},
            create: {
              parentId: user.id,
              studentId: students[idx].id,
              relation: "Parent",
            },
          });
        }
      }
      console.log(`✅ Created parent: ${p.email}`);
    }
  }

  // ==========================================
  // YOUTH LEADER USERS
  // ==========================================
  const leadersData = [
    {
      email: "leader1@gdpt.local",
      name: "Trương Thanh Tùng",
      dharmaName: "Tâm Tùng",
      yearOfBirth: 1990,
      unitIndex: 0,
      level: "Tập",
      phone: "0901234567",
      gdptJoinDate: new Date("2005-01-15"),
      quyYDate: new Date("2008-05-20"),
      quyYName: "Nguyên Tùng",
    },
    {
      email: "leader2@gdpt.local",
      name: "Nguyễn Thị Hạnh",
      dharmaName: "Tâm Hạnh",
      yearOfBirth: 1992,
      unitIndex: 0,
      level: "Tín",
      phone: "0912345678",
      gdptJoinDate: new Date("2007-03-10"),
      quyYDate: new Date("2010-08-15"),
      quyYName: "Nguyên Hạnh",
    },
    {
      email: "leader3@gdpt.local",
      name: "Lê Văn Đức",
      dharmaName: "Tâm Đức",
      yearOfBirth: 1988,
      unitIndex: 1,
      level: "Tấn",
      phone: "0923456789",
      gdptJoinDate: new Date("2003-06-01"),
      quyYDate: new Date("2006-12-08"),
      quyYName: "Nguyên Đức",
    },
    {
      email: "leader4@gdpt.local",
      name: "Phạm Thị Lan",
      dharmaName: "Tâm Lan",
      yearOfBirth: 1995,
      unitIndex: 2,
      level: "Tập",
      phone: "0934567890",
      gdptJoinDate: new Date("2010-09-01"),
    },
  ];
  const leaderPassword = "leader123";

  for (const l of leadersData) {
    await deleteUserIfExists(l.email);

    const created = await createUserViaAPI(l.email, leaderPassword, l.name);
    if (created) {
      const user = await prisma.user.update({
        where: { email: l.email },
        data: { role: "LEADER", emailVerified: true },
      });

      // Create leader profile
      await prisma.youthLeader.upsert({
        where: { userId: user.id },
        update: {
          name: l.name,
          dharmaName: l.dharmaName,
          yearOfBirth: l.yearOfBirth,
          unitId: units[l.unitIndex].id,
          level: l.level,
          phone: l.phone,
          gdptJoinDate: l.gdptJoinDate,
          quyYDate: l.quyYDate,
          quyYName: l.quyYName,
        },
        create: {
          userId: user.id,
          name: l.name,
          dharmaName: l.dharmaName,
          yearOfBirth: l.yearOfBirth,
          unitId: units[l.unitIndex].id,
          status: "ACTIVE",
          level: l.level,
          phone: l.phone,
          gdptJoinDate: l.gdptJoinDate,
          quyYDate: l.quyYDate,
          quyYName: l.quyYName,
        },
      });
      console.log(`✅ Created leader: ${l.email}`);
    }
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("\n========================================");
  console.log("🌱 Seeding complete!");
  console.log("========================================\n");
  console.log("Test accounts (password shown below):\n");
  console.log("ADMIN:");
  console.log(`  ${adminEmail} / ${adminPassword}`);
  console.log("  ⚠️  Must change password on first login\n");
  console.log("PARENTS:");
  parentsData.forEach(p => console.log(`  ${p.email} / ${parentPassword}`));
  console.log("\nLEADERS:");
  leadersData.forEach(l => console.log(`  ${l.email} / ${leaderPassword}`));
  console.log("\n========================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
