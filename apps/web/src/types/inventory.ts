export type InventoryStatus = "충분" | "주의" | "결품";

export interface MaterialCardData {
  name: string;
  quantity: string;
  unit: string;
  level: number;
  status: InventoryStatus;
  caption: string;
}

export interface MaterialForecast {
  material: string;
  currentStock: string;
  demand: string;
  status: InventoryStatus;
  shortage?: string;
  suggestion: string;
}
