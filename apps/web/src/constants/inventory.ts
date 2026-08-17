import type { InventoryStockStatus, MaterialUnit } from "../types/inventory";

export const MATERIAL_UNIT_LABELS: Record<MaterialUnit, string> = {
  EA: "EA",
  M: "m",
  KG: "kg",
  M2: "㎡",
  SET: "SET",
};

export const INVENTORY_STATUS_TONES = {
  SUFFICIENT: "success",
  LOW: "warning",
  SHORTAGE: "danger",
} as const satisfies Record<
  InventoryStockStatus,
  "success" | "warning" | "danger"
>;
