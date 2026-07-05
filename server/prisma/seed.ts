import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("Admin@1234", salt);
  const accountantPassword = await bcrypt.hash("Password@123", salt);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@samity.com" },
    update: {
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "Admin User",
      email: "admin@samity.com",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { email: "accountant@samity.com" },
    update: {
      name: "Accountant User",
      password: accountantPassword,
      role: "ACCOUNTANT",
      isActive: true,
    },
    create: {
      name: "Accountant User",
      email: "accountant@samity.com",
      password: accountantPassword,
      role: "ACCOUNTANT",
      isActive: true,
    },
  });

  const cashAccount =
    (await prisma.account.findFirst({ where: { name: "Hand Cash" } })) ??
    (await prisma.account.create({
      data: {
        name: "Hand Cash",
        type: "CASH",
        currentBalance: 0,
        isActive: true,
      },
    }));

  const bankAccount =
    (await prisma.account.findFirst({ where: { name: "Main Bank" } })) ??
    (await prisma.account.create({
      data: {
        name: "Main Bank",
        type: "BANK",
        currentBalance: 0,
        isActive: true,
      },
    }));

  console.log("Seeded admin user:", adminUser.email);
  console.log("Seeded accountant user:", accountantUser.email);
  console.log("Seeded cash account:", cashAccount.name);
  console.log("Seeded bank account:", bankAccount.name);
  console.log(
    "Login with admin@samity.com / Admin@1234 or accountant@samity.com / Password@123",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
