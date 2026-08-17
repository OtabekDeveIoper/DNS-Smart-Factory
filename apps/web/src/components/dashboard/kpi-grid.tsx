import { KPI_DEFINITIONS } from "../../constants/dashboard";
import type { DashboardKpis } from "../../types/dashboard";
import styles from "./dashboard-panel.module.css";

interface KpiGridProps {
  kpis: DashboardKpis;
}

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <section className={styles.kpiGrid} aria-label="핵심 생산 지표">
      {KPI_DEFINITIONS.map(({ key, label, unit, detail, tone, icon: Icon }) => (
        <article className={styles.kpiCard} key={key}>
          <div className={styles.kpiHeader}>
            <span>{label}</span>
            <Icon size={17} />
          </div>

          <div className={styles.kpiValue}>
            {kpis[key]}
            <small>{unit}</small>
          </div>

          <div className={`${styles.kpiFooter} ${styles[tone]}`}>{detail}</div>
        </article>
      ))}
    </section>
  );
}
