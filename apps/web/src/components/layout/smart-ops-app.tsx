"use client";

import { formatTime } from "@/lib/helpers";
import {
  LayoutDashboard,
  ListChecks,
  PackageSearch,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { DashboardPanel } from "../dashboard/dashboard-panel";

export function SmartOpsApp() {
  const [clock, setClock] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  useEffect(() => {
    setClock(new Date());

    const timer = window.setInterval(() => {
      setClock(new Date());
    }, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const SelectedIcon = selectedTab.icon;

  return (
    <div className="app-frame">
      <header className="app-bar">
        <div className="brand">
          <div className="brand-mark">DN</div>

          <div>
            <strong>DN SMART OPS</strong>
            <span>Smart Factory MES</span>
          </div>
        </div>

        <div className="app-meta">
          <span className="connection-badge">
            <span className="live-dot" />
            API CONNECTED
          </span>

          <time>
            {clock ? formatTime(clock.toISOString()) : "--/--, --:--:--"}
          </time>

          <span className="demo-badge">DEMO</span>
        </div>
      </header>

      <nav className="tab-bar" aria-label="MES modules">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              type="button"
              key={tab.id}
              className={isActive ? "active" : undefined}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-number">{tab.number}</span>
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="main-content">
        {activeTab === "dashboard" ? (
          <section>
            <DashboardPanel />
          </section>
        ) : (
          <section className="pending-view">
            <SelectedIcon size={30} /> <h2>{selectedTab.label}</h2>
            <span>MES data workspace</span>
          </section>
        )}
      </main>
    </div>
  );
}

type TabId = "dashboard" | "orders" | "inspection" | "inventory" | "quality";

interface Tab {
  id: TabId;
  number: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

const tabs: Tab[] = [
  {
    id: "dashboard",
    number: "01",
    label: "Integrated Control",
    icon: LayoutDashboard,
  },
  {
    id: "orders",
    number: "02",
    label: "Orders & Progress",
    icon: ListChecks,
  },
  {
    id: "inspection",
    number: "03",
    label: "AI Wiring Inspection",
    icon: ScanLine,
  },
  {
    id: "inventory",
    number: "04",
    label: "Materials & Inventory",
    icon: PackageSearch,
  },
  {
    id: "quality",
    number: "05",
    label: "Tests & Traceability",
    icon: ShieldCheck,
  },
];
