import {
  Activity,
  CalendarCheck,
  Factory,
  Gauge,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import type { DashboardKpis } from "../types/dashboard";

interface KpiDefinition {
  key: keyof Omit<DashboardKpis, "generatedAt">;
  tone: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    key: "todayOutput",
    tone: "positive",
    icon: Activity,
  },
  {
    key: "activeUnits",
    tone: "neutral",
    icon: Factory,
  },
  {
    key: "onTimeDeliveryRate",
    tone: "positive",
    icon: CalendarCheck,
  },
  {
    key: "weeklyRework",
    tone: "negative",
    icon: RotateCcw,
  },
  {
    key: "equipmentUtilization",
    tone: "neutral",
    icon: Gauge,
  },
];
