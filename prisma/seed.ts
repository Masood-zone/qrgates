import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

const adminSeed = {
  email: process.env.ADMIN_EMAIL || "admin@qrgates.com",
  password: process.env.ADMIN_PASSWORD || "admin123",
  name: process.env.ADMIN_NAME || "Super Admin",
  phone: process.env.ADMIN_PHONE || "+233200000000",
  address: process.env.ADMIN_ADDRESS || "QRGates Admin Office, Accra, Ghana",
};

async function main() {
  const hashedPassword = await bcrypt.hash(adminSeed.password, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminSeed.email },
    update: {
      name: adminSeed.name,
      phone: adminSeed.phone,
      address: adminSeed.address,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      isOrganizer: false,
      emailVerified: new Date(),
    },
    create: {
      email: adminSeed.email,
      name: adminSeed.name,
      phone: adminSeed.phone,
      address: adminSeed.address,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      isOrganizer: false,
      emailVerified: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      isOrganizer: true,
    },
  });

  console.log("Admin seed completed:");
  console.log({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    status: admin.status,
    isOrganizer: admin.isOrganizer,
  });
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
