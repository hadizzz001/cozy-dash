import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function initAdmin() {
  await prisma.user.upsert({
    where: { username: "admin" },   // prevent duplicates
    update: {},                     // do nothing if exists
    create: {
      username: "admin",
      password: "admin",
    },
  });

  console.log("✅ Admin ensured (admin/admin)");
}
