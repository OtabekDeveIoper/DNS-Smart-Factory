import type { OrderStatus } from "./orders";

export type InventoryStatus = "충분" | "주의" | "결품";

export type MaterialUnit = "EA" | "M" | "KG" | "M2" | "SET";

export type InventoryStockStatus = "SUFFICIENT" | "LOW" | "SHORTAGE";

export interface InventoryAffectedOrder {
  orderNo: string;
  status: OrderStatus;
  dueDate: string;
}

export interface InventoryLot {
  id: string;
  lotNo: string;
  supplierName: string | null;
  currentQuantity: number;
  receivedAt: string;
  expiresAt: string | null;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: MaterialUnit;
  leadTimeDays: number;
  currentStock: number;
  twoWeekDemand: number;
  safetyStock: number;
  requiredStock: number;
  projectedBalance: number;
  shortageQuantity: number;
  suggestedPurchaseQuantity: number;
  status: InventoryStockStatus;
  earliestRequiredAt: string | null;
  purchaseByAt: string | null;
  affectedOrders: InventoryAffectedOrder[];
  lots: InventoryLot[];
}

export interface InventoryOverview {
  planningDays: number;
  summary: {
    totalMaterials: number;
    shortageMaterials: number;
    lowStockMaterials: number;
  };
  items: InventoryItem[];
  generatedAt: string;
}

export interface InventoryCardViewModel {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  level: number;
  status: InventoryStatus;
  caption: string;
}

export interface InventoryForecastRow {
  id: string;
  material: string;
  currentStock: string;
  demand: string;
  status: InventoryStatus;
  shortage: string | null;
  suggestion: string;
}
