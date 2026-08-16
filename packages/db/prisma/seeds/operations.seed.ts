import {
  OrderStatus,
  ProcessStatus,
  type PrismaClient,
} from "../../generated/prisma/client.cjs";

const baseBom = [
  { materialCode: "MCCB-100A", quantity: 2 },
  { materialCode: "MC-22B", quantity: 6 },
  { materialCode: "CU-BUS-50", quantity: 4 },
  { materialCode: "STEEL-1.6T", quantity: 3 },
  { materialCode: "TERM-2.5", quantity: 20 },
];

const equipmentByStep: Record<string, string> = {
  SHEET_METAL: "PRESS-01",
  PAINTING: "PAINT-01",
  ASSEMBLY: "ASM-01",
  WIRING: "WIRE-01",
  TESTING: "TEST-01",
};

const completedStepsByOrder: Record<string, number> = {
  "DN-2607-017": 3,
  "DN-2606-096": 2,
  "DN-2607-021": 1,
  "DN-2606-088": 4,
  "DN-2608-002": 3,
  "DN-2608-005": 4,
  "DN-2607-014": 3,
};

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function getCompletedStepCount(orderNo: string, status: OrderStatus) {
  if (status === OrderStatus.COMPLETED) return 5;
  if (status === OrderStatus.PLANNED) return 0;
  if (status === OrderStatus.ON_HOLD) return 2;

  return completedStepsByOrder[orderNo] ?? 2;
}

function getProductFactor(productName: string) {
  if (productName === "ATS Panel") return 0.8;
  if (productName === "Distribution Board") return 1.2;
  return 1;
}

export async function seedOperations(prisma: PrismaClient) {
  const [orders, processSteps, materials] = await Promise.all([
    prisma.order.findMany({
      include: { units: true },
      orderBy: { orderNo: "asc" },
    }),
    prisma.processStep.findMany({
      orderBy: { sequence: "asc" },
    }),
    prisma.material.findMany(),
  ]);

  const materialByCode = new Map(
    materials.map((material) => [material.code, material]),
  );

  for (const order of orders) {
    const productFactor = getProductFactor(order.productName);

    for (const item of baseBom) {
      const material = materialByCode.get(item.materialCode);

      if (!material) {
        throw new Error(`Material not found: ${item.materialCode}`);
      }

      const bomData = {
        quantityPerUnit: item.quantity * productFactor,
        scrapRate: 3,
      };

      await prisma.bomItem.upsert({
        where: {
          orderId_materialId: {
            orderId: order.id,
            materialId: material.id,
          },
        },
        update: bomData,
        create: {
          orderId: order.id,
          materialId: material.id,
          ...bomData,
        },
      });
    }

    const completedStepCount = getCompletedStepCount(
      order.orderNo,
      order.status,
    );

    for (const unit of order.units) {
      let elapsedHours = 0;
      const processStart = order.plannedStartAt ?? order.orderDate;

      for (const step of processSteps) {
        const plannedStart = addHours(processStart, elapsedHours);
        const standardHours = Number(step.standardHours);

        const isCompleted = step.sequence <= completedStepCount;
        const isCurrent =
          step.sequence === completedStepCount + 1 &&
          order.status !== OrderStatus.PLANNED &&
          order.status !== OrderStatus.COMPLETED;

        let status: ProcessStatus = ProcessStatus.PENDING;

        if (isCompleted) {
          status = ProcessStatus.COMPLETED;
        } else if (isCurrent) {
          status =
            order.status === OrderStatus.ON_HOLD
              ? ProcessStatus.BLOCKED
              : ProcessStatus.IN_PROGRESS;
        }

        const hasWiringDefect =
          order.orderNo === "DN-2607-014" &&
          unit.unitNumber === 2 &&
          step.code === "WIRING";

        const recordData = {
          status,
          equipmentCode: equipmentByStep[step.code],
          plannedStart,
          startedAt: isCompleted || isCurrent ? plannedStart : null,
          completedAt: isCompleted
            ? addHours(plannedStart, standardHours)
            : null,
          operatorName:
            isCompleted || isCurrent ? `Operator-${step.sequence}` : null,
          goodQty: isCompleted ? 1 : 0,
          defectQty: hasWiringDefect ? 1 : 0,
          reworkCount: hasWiringDefect ? 1 : 0,
        };

        await prisma.processRecord.upsert({
          where: {
            unitId_processStepId: {
              unitId: unit.id,
              processStepId: step.id,
            },
          },
          update: recordData,
          create: {
            unitId: unit.id,
            processStepId: step.id,
            ...recordData,
          },
        });

        elapsedHours += standardHours;
      }
    }
  }
}
