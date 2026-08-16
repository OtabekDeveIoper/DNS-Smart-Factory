export interface DashboardKpisResponse {
  todayOutput: number;
  activeUnits: number;
  onTimeDeliveryRate: number;
  weeklyRework: number;
  equipmentUtilization: number;
  generatedAt: string;
}

export type UtilizationRow = {
  utilization: number | string | null;
};
