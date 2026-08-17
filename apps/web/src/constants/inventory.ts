import type {
  InventoryStatus,
  InventoryStockStatus,
  MaterialUnit,
} from "../types/inventory";

export const MATERIAL_LABELS: Record<string, string> = {
  "CU-BUS-50": "동 부스바 (50×5)",
  "MC-22B": "전자접촉기 (MC-22b)",
  "MCCB-100A": "MCCB (100A)",
  "STEEL-1.6T": "외함 강판 (1.6T)",
  "TERM-2.5": "단자대 (2.5mm)",
};

export const MATERIAL_UNIT_LABELS: Record<MaterialUnit, string> = {
  EA: "EA",
  M: "m",
  KG: "kg",
  M2: "㎡",
  SET: "SET",
};

export const INVENTORY_STATUS_LABELS: Record<
  InventoryStockStatus,
  InventoryStatus
> = {
  SUFFICIENT: "충분",
  LOW: "주의",
  SHORTAGE: "결품",
};

export const INVENTORY_STATUS_TONES = {
  충분: "success",
  주의: "warning",
  결품: "danger",
} as const satisfies Record<InventoryStatus, "success" | "warning" | "danger">;
