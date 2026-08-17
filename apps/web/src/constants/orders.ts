import type { DeliveryRiskLevel, OrderTableStatus } from "../types/orders";

export const ORDER_STATUS_TONES = {
  ON_TRACK: "success",
  MEDIUM: "warning",
  HIGH: "danger",
  OVERDUE: "danger",
  ON_HOLD: "muted",
  CANCELLED: "muted",
  COMPLETED: "info",
} as const satisfies Record<
  OrderTableStatus,
  "success" | "warning" | "danger" | "info" | "muted"
>;

export const RISKY_ORDER_STATUSES: ReadonlySet<OrderTableStatus> = new Set([
  "MEDIUM",
  "HIGH",
  "OVERDUE",
]);

export const DELIVERY_RISK_PRIORITY: Record<DeliveryRiskLevel, number> = {
  COMPLETED: 0,
  ON_TRACK: 1,
  MEDIUM: 2,
  HIGH: 3,
  OVERDUE: 4,
};
