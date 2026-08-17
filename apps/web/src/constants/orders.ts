import type { DeliveryRiskLevel, OrderTableStatus } from "../types/orders";

export const PRODUCT_LABELS: Record<string, string> = {
  "MCC Panel": "MCC반",
  "ATS Panel": "자동절체반",
  "Distribution Board": "분전반",
};

export const DELIVERY_RISK_LABELS: Record<DeliveryRiskLevel, OrderTableStatus> =
  {
    COMPLETED: "완료",
    OVERDUE: "기한초과",
    HIGH: "납기위험",
    MEDIUM: "지연주의",
    ON_TRACK: "정상",
  };

export const ORDER_STATUS_TONES = {
  정상: "success",
  지연주의: "warning",
  납기위험: "danger",
  기한초과: "danger",
  보류: "muted",
  취소: "muted",
  완료: "info",
} as const satisfies Record<
  OrderTableStatus,
  "success" | "warning" | "danger" | "info" | "muted"
>;

export const RISKY_ORDER_STATUSES: ReadonlySet<OrderTableStatus> = new Set([
  "지연주의",
  "납기위험",
  "기한초과",
]);

export const DELIVERY_RISK_PRIORITY: Record<DeliveryRiskLevel, number> = {
  COMPLETED: 0,
  ON_TRACK: 1,
  MEDIUM: 2,
  HIGH: 3,
  OVERDUE: 4,
};
