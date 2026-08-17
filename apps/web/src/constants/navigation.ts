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
  icon: LucideIcon;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "dashboard", number: "01", icon: LayoutDashboard },
  { id: "orders", number: "02", icon: ListChecks },
  { id: "inspection", number: "03", icon: ScanLine },
  { id: "inventory", number: "04", icon: PackageSearch },
  { id: "quality", number: "05", icon: ShieldCheck },
];
