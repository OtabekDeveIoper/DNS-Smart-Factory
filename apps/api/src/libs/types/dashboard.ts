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

export interface ProcessLineItem {
  id: string;
  code: string;
  name: string;
  sequence: number;
  status: 'BLOCKED' | 'RUNNING' | 'IDLE';
  completed: number;
  inProgress: number;
  blocked: number;
  total: number;
  completionRate: number;
}

export interface WeeklyPerformancePoint {
  date: string;
  completed: number;
  defects: number;
  reworks: number;
}

export type WeeklyPerformanceRow = {
  date: string;
  completed: bigint | number | string;
  defects: bigint | number | string;
  reworks: bigint | number | string;
};
