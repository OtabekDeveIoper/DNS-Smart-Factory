export interface DashboardKpis {
  todayOutput: number;
  activeUnits: number;
  onTimeDeliveryRate: number;
  weeklyRework: number;
  equipmentUtilization: number;
  generatedAt: string;
}

export interface ProcessLineItem {
  id: string;
  code: string;
  name: string;
  sequence: number;
  status: "BLOCKED" | "RUNNING" | "IDLE";
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

export interface DashboardAlert {
  id: string;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string | null;
  source: string;
  occurredAt: string;
  acknowledgedAt: string | null;
  order: {
    orderNo: string;
  } | null;
  unit: {
    serialNo: string;
  } | null;
}

export interface DashboardOverview {
  kpis: DashboardKpis;
  processLine: ProcessLineItem[];
  weeklyPerformance: WeeklyPerformancePoint[];
  recentAlerts: DashboardAlert[];
}
