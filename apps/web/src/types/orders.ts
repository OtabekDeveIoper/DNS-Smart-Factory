export type OrderStatus =
  "PLANNED" | "IN_PRODUCTION" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

export type UnitStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "INSPECTION"
  | "TESTING"
  | "BLOCKED"
  | "COMPLETED";

export type ProcessStatus =
  "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REWORK" | "BLOCKED";

export type DeliveryRiskLevel =
  "COMPLETED" | "OVERDUE" | "HIGH" | "MEDIUM" | "ON_TRACK";

export interface DeliveryRisk {
  level: DeliveryRiskLevel;
  remainingStandardHours: number;
  productionDays: number;
  bufferDays: number;
  requiredDays: number;
  availableDays: number;
  marginDays: number;
  projectedCompletionAt: string | null;
}

export interface OrderCurrentProcess {
  code: string;
  name: string;
  sequence: number;
  status: ProcessStatus;
}

export interface OrderUnitSummary {
  id: string;
  serialNo: string;
  unitNumber: number;
  status: UnitStatus;
  startedAt: string | null;
  completedAt: string | null;
  progressPercent: number;
  remainingStandardHours: number;
  currentProcess: OrderCurrentProcess | null;
}

export interface OrderListItem {
  id: string;
  orderNo: string;
  customer: {
    code: string;
    name: string;
  };
  productName: string;
  modelName: string | null;
  quantity: number;
  status: OrderStatus;
  orderDate: string;
  plannedStartAt: string | null;
  dueDate: string;
  completedAt: string | null;
  progressPercent: number;
  completedUnits: number;
  activeUnits: number;
  deliveryRisk: DeliveryRisk;
  units: OrderUnitSummary[];
}

export type OrderTableStatus =
  "정상" | "지연주의" | "납기위험" | "기한초과" | "보류" | "취소" | "완료";

export interface OrderTableRow {
  orderNo: string;
  product: string;
  customer: string;
  dueDate: string;
  progress: number;
  currentProcess: string;
  status: OrderTableStatus;
  deliveryRisk: DeliveryRisk;
}
