import {
  LayoutDashboard,
  ListChecks,
  PackageSearch,
  ScanLine,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AppTabId } from "../types/navigation";

export interface NavigationItem {
  id: AppTabId;
  number: string;
  label: string;
  icon: LucideIcon;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "dashboard", number: "01", label: "통합 관제", icon: LayoutDashboard },
  { id: "orders", number: "02", label: "수주·공정 진척", icon: ListChecks },
  { id: "inspection", number: "03", label: "AI 배선검사", icon: ScanLine },
  { id: "inventory", number: "04", label: "자재·재고", icon: PackageSearch },
  { id: "quality", number: "05", label: "시험·품질이력", icon: ShieldCheck },
];
