import {
  OrderStatus,
  UnitStatus,
  type PrismaClient,
} from "../../generated/prisma/client";

const orderNumbers = [
  "DN-2607-011",
  "DN-2607-014",
  "DN-2607-017",
  "DN-2606-096",
  "DN-2607-021",
  "DN-2606-088",
  "DN-2608-002",
  "DN-2608-005",
  "DN-2608-009",
  "DN-2608-012",
];

const products = ["MCC Panel", "ATS Panel", "Distribution Board"];
const quantities = [2, 3, 3, 2, 4, 1, 3, 2, 2, 4];
const dueOffsets = [-8, -2, 2, 4, 6, 8, 10, 12, 5, 18];

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const statuses: OrderStatus[] = [
  OrderStatus.IN_PRODUCTION, // DN-2607-011
  OrderStatus.IN_PRODUCTION, // DN-2607-014
  OrderStatus.IN_PRODUCTION, // DN-2607-017
  OrderStatus.COMPLETED, // DN-2606-096
  OrderStatus.PLANNED, // DN-2607-021
  OrderStatus.COMPLETED, // DN-2606-088
  OrderStatus.IN_PRODUCTION,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.ON_HOLD,
  OrderStatus.PLANNED,
];

function getOrderStatus(index: number) {
  return statuses[index];
}

function getUnitStatus(orderStatus: OrderStatus, index: number): UnitStatus {
  if (orderStatus === OrderStatus.COMPLETED) return UnitStatus.COMPLETED;
  if (orderStatus === OrderStatus.PLANNED) return UnitStatus.WAITING;
  if (orderStatus === OrderStatus.ON_HOLD) return UnitStatus.BLOCKED;
  if (index === 6) return UnitStatus.INSPECTION;
  if (index === 7) return UnitStatus.TESTING;
  return UnitStatus.IN_PROGRESS;
}

export async function seedOrders(prisma: PrismaClient) {
  const customers = await prisma.customer.findMany({
    orderBy: { code: "asc" },
  });

  if (customers.length === 0) {
    throw new Error("Seed master data before orders");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = 0; index < orderNumbers.length; index++) {
    const status = getOrderStatus(index);
    const dueDate = addDays(today, dueOffsets[index]);
    const plannedStartAt = addDays(today, -10 + index);

    const completedAt =
      status === OrderStatus.COMPLETED
        ? addDays(dueDate, index === 0 ? -1 : 1)
        : null;

    const order = await prisma.order.upsert({
      where: { orderNo: orderNumbers[index] },
      update: {
        status,
        dueDate,
        plannedStartAt,
        completedAt,
      },
      create: {
        orderNo: orderNumbers[index],
        customerId: customers[index % customers.length].id,
        productName: products[index % products.length],
        modelName: `MODEL-${String(index + 1).padStart(2, "0")}`,
        quantity: quantities[index],
        status,
        orderDate: addDays(today, -20 + index),
        plannedStartAt,
        dueDate,
        completedAt,
        bufferDays: index % 3 === 0 ? 2 : 1,
      },
    });

    for (let unitNumber = 1; unitNumber <= order.quantity; unitNumber++) {
      const serialNo = `${order.orderNo}-U${String(unitNumber).padStart(2, "0")}`;

      const unitStatus = getUnitStatus(status, index);

      await prisma.unit.upsert({
        where: { serialNo },
        update: {
          status: unitStatus,
          startedAt: unitStatus === UnitStatus.WAITING ? null : plannedStartAt,
          completedAt,
        },
        create: {
          orderId: order.id,
          serialNo,
          unitNumber,
          status: unitStatus,
          startedAt: unitStatus === UnitStatus.WAITING ? null : plannedStartAt,
          completedAt,
        },
      });
    }
  }
}
