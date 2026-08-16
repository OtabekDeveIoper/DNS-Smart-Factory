import {
  ProcessStatus,
  Severity,
  type Prisma,
  type PrismaClient,
} from "../../generated/prisma/client.cjs";

const materialProcessMap: Record<string, string> = {
  "STEEL-1.6T": "SHEET_METAL",
  "MCCB-100A": "ASSEMBLY",
  "MC-22B": "ASSEMBLY",
  "CU-BUS-50": "ASSEMBLY",
  "TERM-2.5": "WIRING",
};

async function saveEvent(
  prisma: PrismaClient,
  data: Prisma.EventUncheckedCreateInput,
) {
  const existing = await prisma.event.findFirst({
    where: {
      type: data.type,
      orderId: data.orderId ?? null,
      unitId: data.unitId ?? null,
    },
  });

  if (existing) {
    await prisma.event.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.event.create({ data });
  }
}

export async function seedTraceability(prisma: PrismaClient) {
  const orders = await prisma.order.findMany({
    include: {
      bomItems: {
        include: { material: true },
      },
      units: {
        include: {
          processRecords: {
            include: { processStep: true },
          },
        },
      },
    },
  });

  const inventoryLots = await prisma.inventoryLot.findMany({
    orderBy: { receivedAt: "asc" },
  });

  const lotByMaterialId = new Map<string, (typeof inventoryLots)[number]>();

  for (const lot of inventoryLots) {
    if (!lotByMaterialId.has(lot.materialId)) {
      lotByMaterialId.set(lot.materialId, lot);
    }
  }

  for (const order of orders) {
    for (const unit of order.units) {
      for (const bomItem of order.bomItems) {
        const processCode = materialProcessMap[bomItem.material.code];

        if (!processCode) continue;

        const processRecord = unit.processRecords.find(
          (record) => record.processStep.code === processCode,
        );

        if (!processRecord) continue;

        const processReached =
          processRecord.status === ProcessStatus.COMPLETED ||
          processRecord.status === ProcessStatus.IN_PROGRESS ||
          processRecord.status === ProcessStatus.REWORK;

        if (!processReached) continue;

        const inventoryLot = lotByMaterialId.get(bomItem.materialId);

        if (!inventoryLot) {
          throw new Error(`Inventory lot not found: ${bomItem.material.code}`);
        }

        const usageData = {
          inventoryLotId: inventoryLot.id,
          orderId: order.id,
          unitId: unit.id,
          processRecordId: processRecord.id,
          quantity: bomItem.quantityPerUnit,
          consumedAt:
            processRecord.completedAt ?? processRecord.startedAt ?? new Date(),
          operatorName: processRecord.operatorName,
          notes: `Seeded usage for ${bomItem.material.code}`,
        };

        const existingUsage = await prisma.materialUsage.findFirst({
          where: {
            inventoryLotId: inventoryLot.id,
            unitId: unit.id,
            processRecordId: processRecord.id,
          },
        });

        if (existingUsage) {
          await prisma.materialUsage.update({
            where: { id: existingUsage.id },
            data: usageData,
          });
        } else {
          await prisma.materialUsage.create({
            data: usageData,
          });
        }
      }
    }
  }

  const findOrder = (orderNo: string) => {
    const order = orders.find((item) => item.orderNo === orderNo);

    if (!order) {
      throw new Error(`Order not found: ${orderNo}`);
    }

    return order;
  };

  const findUnit = (order: (typeof orders)[number], unitNumber: number) => {
    const unit = order.units.find((item) => item.unitNumber === unitNumber);

    if (!unit) {
      throw new Error(`Unit ${unitNumber} not found in ${order.orderNo}`);
    }

    return unit;
  };

  const riskyOrder = findOrder("DN-2607-014");
  const riskyUnit = findUnit(riskyOrder, 2);

  await saveEvent(prisma, {
    orderId: riskyOrder.id,
    unitId: riskyUnit.id,
    type: "DELIVERY_RISK",
    severity: Severity.WARNING,
    title: "Delivery deadline at risk",
    message: "Remaining standard time exceeds available delivery time.",
    source: "SCHEDULER",
    payload: {
      remainingDays: 5.5,
      bufferDays: riskyOrder.bufferDays,
    },
  });

  await saveEvent(prisma, {
    orderId: riskyOrder.id,
    unitId: riskyUnit.id,
    type: "AI_WIRING_DEFECT",
    severity: Severity.CRITICAL,
    title: "Possible wiring defect detected",
    message: "Manual review required at terminal block TB-12.",
    source: "AI_VISION_MOCK",
    payload: {
      cameraCode: "CAM-01",
      confidence: 97.2,
    },
  });

  const materialOrder = findOrder("DN-2607-021");

  await saveEvent(prisma, {
    orderId: materialOrder.id,
    type: "MATERIAL_SHORTAGE",
    severity: Severity.WARNING,
    title: "Enclosure steel shortage",
    message: "Two-week demand exceeds current inventory.",
    source: "INVENTORY_PLANNER",
    payload: {
      materialCode: "STEEL-1.6T",
      currentQuantity: 57,
    },
  });

  const blockedOrder = findOrder("DN-2608-009");

  await saveEvent(prisma, {
    orderId: blockedOrder.id,
    unitId: findUnit(blockedOrder, 1).id,
    type: "PROCESS_BLOCKED",
    severity: Severity.CRITICAL,
    title: "Assembly process blocked",
    message: "Operator confirmation is required.",
    source: "MES",
  });

  const failedTestOrder = findOrder("DN-2606-096");

  await saveEvent(prisma, {
    orderId: failedTestOrder.id,
    unitId: findUnit(failedTestOrder, 2).id,
    type: "TEST_FAILURE",
    severity: Severity.CRITICAL,
    title: "Sequence operation test failed",
    message: "Unit requires rework and retesting.",
    source: "QUALITY",
  });
}
