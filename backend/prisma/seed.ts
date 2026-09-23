import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.user.upsert({
    where: { email: "demo@faceb0ok.local" },
    update: {},
    create: {
      firstName: "Demo",
      lastName: "User",
      username: "demo_user",
      email: "demo@faceb0ok.local",
      passwordHash: await hashPassword("DemoPassword123!"),
      dateOfBirth: new Date("2000-01-01T00:00:00.000Z"),
    },
  });
  console.log("Demo account is ready.");
}

main().finally(() => prisma.$disconnect());