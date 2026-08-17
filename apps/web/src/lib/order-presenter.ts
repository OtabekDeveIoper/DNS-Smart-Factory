import type { TFunction } from "i18next";
import { DELIVERY_RISK_PRIORITY } from "../constants/orders";
import { KNOWN_PROCESS_CODES } from "../constants/processes";
import type {
  OrderListItem,
  OrderTableRow,
  OrderTableStatus,
} from "../types/orders";
import { formatMonthDay } from "./helpers";

function getCurrentProcess(order: OrderListItem, t: TFunction) {
  const processes = order.units
    .map((unit) => unit.currentProcess)
    .filter((process) => process !== null)
    .sort((first, second) => first.sequence - second.sequence);
  const currentProcess = processes[0];

  if (currentProcess) {
    return KNOWN_PROCESS_CODES.has(currentProcess.code)
      ? t(`processes.${currentProcess.code}`)
      : currentProcess.name;
  }

  return order.status === "COMPLETED"
    ? t("orders.currentProcess.shipping")
    : t("orders.currentProcess.production");
}

function getOrderStatus(order: OrderListItem): OrderTableStatus {
  if (order.status === "CANCELLED" || order.status === "ON_HOLD") {
    return order.status;
  }

  return order.deliveryRisk.level;
}

export function presentOrder(
  order: OrderListItem,
  t: TFunction,
  language?: string,
): OrderTableRow {
  const productName = t(`orders.products.${order.productName}`, {
    defaultValue: order.productName,
  });

  return {
    orderNo: order.orderNo,
    product: t("orders.panelQuantity", {
      product: productName,
      count: order.quantity,
    }),
    customer: order.customer.name,
    dueDate: formatMonthDay(order.dueDate, language),
    progress: order.progressPercent,
    currentProcess: getCurrentProcess(order, t),
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
