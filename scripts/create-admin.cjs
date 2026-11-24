
require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    console.log("\nWEMA SAFARIS - Create Admin Account\n");

    const name = (await rl.question("Admin name: ")).trim();
    const email = (await rl.question("Admin email: "))
      .trim()
      .toLowerCase();
    const password = await rl.question("Admin password (input will be visible): ");

    if (!name || !email || password.length < 12) {
      throw new Error(
        "Enter a name, valid email and password of at least 12 characters."
      );
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new Error("An admin with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.admin.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    console.log("\nAdmin account created successfully!");
    console.log("You can now use this email to log in.");
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("\nSetup failed:", error.message);
  process.exitCode = 1;
});
