"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NAVIGATION_ITEMS } from "../../constants/navigation";
import { formatTime } from "../../lib/helpers";
import type { AppTabId } from "../../types/navigation";
import { DashboardPanel } from "../dashboard/dashboard-panel";
import { InspectionView } from "../inspection/inspection-view";
import { InventoryView } from "../inventory/inventory-view";
import { OrdersView } from "../orders/orders-view";
import { QualityView } from "../quality/quality-view";
import { LanguageSwitcher } from "./language-switcher";
import styles from "./smart-ops-app.module.css";

const views: Record<AppTabId, ReactNode> = {
  dashboard: <DashboardPanel />,
  orders: <OrdersView />,
  inspection: <InspectionView />,
  inventory: <InventoryView />,
  quality: <QualityView />,
};

export function SmartOpsApp() {
  const { i18n, t } = useTranslation();
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
            <strong>{t("layout.brandName")}</strong>
            <span>{t("layout.brandSubtitle")}</span>
          </div>
        </div>
        <div className={styles.appMeta}>
          <span className={styles.levelBadge}>{t("layout.systemLevel")}</span>
          <span className={styles.connectionBadge}>
            <span className={styles.liveDot} />
            {t("layout.gatewayStatus")}
          </span>
          <time>
            {clock
              ? formatTime(clock.toISOString(), i18n.resolvedLanguage)
              : "--/--, --:--:--"}
          </time>
          <span className={styles.demoBadge}>{t("layout.demoBadge")}</span>
          <LanguageSwitcher />
        </div>
      </header>

      <nav
        className={styles.tabBar}
        role="tablist"
        aria-label={t("layout.navigationLabel")}
      >
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
              <span>{t(`layout.navigation.${item.id}`)}</span>
            </button>
          );
        })}
      </nav>

      <main className={styles.mainContent} role="tabpanel">
        {views[activeTab]}
      </main>

      <footer className={styles.footer}>{t("layout.footer")}</footer>
    </div>
  );
}
