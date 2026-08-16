import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { seedMasterData } from "./seeds/master-data.seed";
import { seedOrders } from "./seeds/orders.seed";
import { seedOperations } from "./seeds/operations.seed";
import { seedQuality } from "./seeds/quality.seed";
import { seedTraceability } from "./seeds/traceability.seed";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding master data...");
  await seedMasterData(prisma);

  console.log("Seeding orders and units...");
  await seedOrders(prisma);

  console.log("Seeding BOM and process records...");
  await seedOperations(prisma);

  console.log("Seeding inspections and tests...");
  await seedQuality(prisma);

  console.log("Seeding material usage and events...");
  await seedTraceability(prisma);

  console.log("Master data seeded successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
