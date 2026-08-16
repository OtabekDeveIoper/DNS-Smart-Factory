import {
  MaterialUnit,
  type PrismaClient,
} from "../../generated/prisma/client";

export async function seedMasterData(prisma: PrismaClient) {
  const customers = [
    { code: "CUST-001", name: "Seoul Industrial Systems" },
    { code: "CUST-002", name: "Hanul Automation" },
    { code: "CUST-003", name: "Mirae Electric" },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { code: customer.code },
      update: customer,
      create: customer,
    });
  }

  const processSteps = [
    { code: "SHEET_METAL", name: "Sheet Metal & Bending", sequence: 1, standardHours: 6 },
    { code: "PAINTING", name: "Painting", sequence: 2, standardHours: 8 },
    { code: "ASSEMBLY", name: "Busbar & Assembly", sequence: 3, standardHours: 12 },
    { code: "WIRING", name: "Wiring", sequence: 4, standardHours: 28 },
    { code: "TESTING", name: "Inspection & Testing", sequence: 5, standardHours: 8 },
  ];

  for (const step of processSteps) {
    await prisma.processStep.upsert({
      where: { code: step.code },
      update: step,
      create: step,
    });
  }

  const materials = [
    { code: "MCCB-100A", name: "Molded Case Circuit Breaker", category: "ELECTRICAL", unit: MaterialUnit.EA, leadTimeDays: 7, safetyStock: 10 },
    { code: "MC-22B", name: "Magnetic Contactor MC-22b", category: "ELECTRICAL", unit: MaterialUnit.EA, leadTimeDays: 10, safetyStock: 20 },
    { code: "CU-BUS-50", name: "Copper Busbar 50x5", category: "METAL", unit: MaterialUnit.M, leadTimeDays: 5, safetyStock: 30 },
    { code: "STEEL-1.6T", name: "Enclosure Steel Plate 1.6T", category: "METAL", unit: MaterialUnit.M2, leadTimeDays: 14, safetyStock: 20 },
    { code: "TERM-2.5", name: "Terminal Block 2.5mm", category: "ELECTRICAL", unit: MaterialUnit.EA, leadTimeDays: 4, safetyStock: 100 },
  ];

  for (const material of materials) {
    const saved = await prisma.material.upsert({
      where: { code: material.code },
      update: material,
      create: material,
    });

    await prisma.inventoryLot.upsert({
      where: { lotNo: `LOT-${material.code}-001` },
      update: {},
      create: {
        lotNo: `LOT-${material.code}-001`,
        materialId: saved.id,
        supplierName: "Demo Supplier",
        receivedQuantity: 200,
        currentQuantity: material.code === "STEEL-1.6T" ? 57 : 120,
        receivedAt: new Date("2026-08-01T09:00:00+09:00"),
      },
    });
  }
}