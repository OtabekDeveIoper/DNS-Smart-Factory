import {
  DELIVERY_RISK_LABELS,
  DELIVERY_RISK_PRIORITY,
  PRODUCT_LABELS,
} from "../constants/orders";
import { PROCESS_LABELS } from "../constants/processes";
import type {
  OrderListItem,
  OrderTableRow,
  OrderTableStatus,
} from "../types/orders";

function formatMonthDay(value: string) {
  const date = new Date(value);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${month}-${day}`;
}

function getCurrentProcess(order: OrderListItem) {
  const processes = order.units
    .map((unit) => unit.currentProcess)
    .filter((process) => process !== null)
    .sort((first, second) => first.sequence - second.sequence);

  const currentProcess = processes[0];

  if (currentProcess) {
    return PROCESS_LABELS[currentProcess.code] ?? currentProcess.name;
  }

  return order.status === "COMPLETED" ? "출하 대기" : "생산 대기";
}

function getOrderStatus(order: OrderListItem): OrderTableStatus {
  if (order.status === "CANCELLED") {
    return "취소";
  }

  if (order.status === "ON_HOLD") {
    return "보류";
  }

  return DELIVERY_RISK_LABELS[order.deliveryRisk.level];
}

export function presentOrder(order: OrderListItem): OrderTableRow {
  const productName = PRODUCT_LABELS[order.productName] ?? order.productName;

  return {
    orderNo: order.orderNo,
    product: `${productName} ${order.quantity}면`,
    customer: order.customer.name,
    dueDate: formatMonthDay(order.dueDate),
    progress: order.progressPercent,
    currentProcess: getCurrentProcess(order),
    status: getOrderStatus(order),
    deliveryRisk: order.deliveryRisk,
  };
}

export function selectMostCriticalOrder(
  orders: OrderListItem[],
): OrderListItem | null {
  const activeOrders = orders
    .filter(
      (order) => order.status !== "COMPLETED" && order.status !== "CANCELLED",
    )
    .sort((first, second) => {
      const priorityDifference =
        DELIVERY_RISK_PRIORITY[second.deliveryRisk.level] -
        DELIVERY_RISK_PRIORITY[first.deliveryRisk.level];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return first.deliveryRisk.marginDays - second.deliveryRisk.marginDays;
    });

  return activeOrders[0] ?? null;
}
