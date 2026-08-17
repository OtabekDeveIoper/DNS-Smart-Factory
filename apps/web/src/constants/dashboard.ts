import {
  Activity,
  CalendarCheck,
  Factory,
  Gauge,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import type { DashboardKpis, ProcessLineItem } from "../types/dashboard";

interface KpiDefinition {
  key: keyof Omit<DashboardKpis, "generatedAt">;
  label: string;
  unit: string;
  detail: string;
  tone: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    key: "todayOutput",
    label: "금일 공정실적 (자동집계)",
    unit: "건",
    detail: "▲ 수기 마감 대비 실시간",
    tone: "positive",
    icon: Activity,
  },
  {
    key: "activeUnits",
    label: "진행 중 호기",
    unit: "면",
    detail: "납기 임박 3면 포함",
    tone: "neutral",
    icon: Factory,
  },
  {
    key: "onTimeDeliveryRate",
    label: "납기준수율 (월간)",
    unit: "%",
    detail: "▲ 2.1%p",
    tone: "positive",
    icon: CalendarCheck,
  },
  {
    key: "weeklyRework",
    label: "재작업 발생 (금주)",
    unit: "건",
    detail: "배선 1 · 도장 1",
    tone: "negative",
    icon: RotateCcw,
  },
  {
    key: "equipmentUtilization",
    label: "주요설비 가동률",
    unit: "%",
    detail: "절곡기 · CNC 기준",
    tone: "neutral",
    icon: Gauge,
  },
];

export const PROCESS_STATUS_LABELS: Record<ProcessLineItem["status"], string> =
  {
    RUNNING: "가동",
    BLOCKED: "지연주의",
    IDLE: "대기",
  };
