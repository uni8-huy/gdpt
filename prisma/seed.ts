import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create admin via Better Auth API (ensures correct password hashing)
async function createAdminViaAPI(
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

async function main() {
  console.log("Seeding database...");

  const adminEmail = "admin@gdpt.local";
  const adminPassword = "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    // Delete existing to recreate with proper hash
    await prisma.account.deleteMany({ where: { userId: existingAdmin.id } });
    await prisma.session.deleteMany({ where: { userId: existingAdmin.id } });
    await prisma.user.delete({ where: { id: existingAdmin.id } });
    console.log("Deleted existing admin to recreate...");
  }

  {
    // Try API first (requires server running)
    const created = await createAdminViaAPI(
      adminEmail,
      adminPassword,
      "Quản trị viên"
    );
    if (created) {
      // Update role to ADMIN
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "ADMIN", emailVerified: true, forcePasswordChange: true },
      });
      console.log("✅ Created default admin via API:");
    } else {
      console.log("⚠️  Server not running. Start server and run seed again.");
      console.log("   Or create admin manually at /register");
    }
  }

  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log("   ⚠️  Please change password after first login!");

  // Create sample units
  const units = ["GĐPT Chánh Giác", "GĐPT Bửu Sơn", "GĐPT Pháp Hoa"];
  for (const name of units) {
    await prisma.unit.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("✅ Created sample units");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
