import { KPI_DEFINITIONS } from "../../constants/dashboard";
import { DASHBOARD_KPIS } from "../../data/dashboard.mock";
import styles from "./dashboard-panel.module.css";

export function KpiGrid() {
  return (
    <section className={styles.kpiGrid} aria-label="핵심 생산 지표">
      {KPI_DEFINITIONS.map(({ key, label, unit, detail, tone, icon: Icon }) => (
        <article className={styles.kpiCard} key={key}>
          <div className={styles.kpiHeader}>
            <span>{label}</span>
            <Icon size={17} />
          </div>
          <div className={styles.kpiValue}>
            {DASHBOARD_KPIS[key]}
            <small>{unit}</small>
          </div>
          <div className={`${styles.kpiFooter} ${styles[tone]}`}>{detail}</div>
        </article>
      ))}
    </section>
  );
}
