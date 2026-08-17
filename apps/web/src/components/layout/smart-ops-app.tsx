"use client";

import { useEffect, useState, type ReactNode } from "react";
import { NAVIGATION_ITEMS } from "../../constants/navigation";
import { formatTime } from "../../lib/helpers";
import type { AppTabId } from "../../types/navigation";
import { DashboardPanel } from "../dashboard/dashboard-panel";
import { InspectionView } from "../inspection/inspection-view";
import { InventoryView } from "../inventory/inventory-view";
import { OrdersView } from "../orders/orders-view";
import { QualityView } from "../quality/quality-view";
import styles from "./smart-ops-app.module.css";

const views: Record<AppTabId, ReactNode> = {
  dashboard: <DashboardPanel />,
  orders: <OrdersView />,
  inspection: <InspectionView />,
  inventory: <InventoryView />,
  quality: <QualityView />,
};

export function SmartOpsApp() {
  const [activeTab, setActiveTab] = useState<AppTabId>("dashboard");
  const [clock, setClock] = useState<Date | null>(null);

  useEffect(() => {
    const updateClock = () => setClock(new Date());
    const initialTick = window.setTimeout(updateClock, 0);
    const timer = window.setInterval(updateClock, 1_000);

    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles.appFrame}>
      <header className={styles.appBar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>DN</div>
          <div>
            <strong>DN전기 SMART OPS</strong>
            <span>IoT · MES · AI 통합 관제 — 과제용 시안</span>
          </div>
        </div>
        <div className={styles.appMeta}>
          <span className={styles.levelBadge}>
            생산정보 실시간 수집·분석 시스템
          </span>
          <span className={styles.connectionBadge}>
            <span className={styles.liveDot} />
            수집 게이트웨이 OPC-UA 정상
          </span>
          <time>
            {clock ? formatTime(clock.toISOString()) : "--/--, --:--:--"}
          </time>
          <span className={styles.demoBadge}>DEMO · 시연용 샘플 데이터</span>
        </div>
      </header>

      <nav className={styles.tabBar} role="tablist" aria-label="시스템 모듈">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const selected = item.id === activeTab;
          return (
            <button
              type="button"
              role="tab"
              aria-selected={selected}
              className={selected ? styles.activeTab : undefined}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.tabNumber}>{item.number}</span>
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <main className={styles.mainContent} role="tabpanel">
        {views[activeTab]}
      </main>

      <footer className={styles.footer}>
        본 화면은 채용 과제용 시스템 시안(DEMO)이며, 회사명·수치·수주정보는 모두
        가상의 샘플 데이터입니다 · 표준 참고: OPC-UA(IEC 62541) / AAS(IEC 63278)
        · ㈜에이비에이치(ABH)
      </footer>
    </div>
  );
}
