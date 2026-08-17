import { KPI_DEFINITIONS } from "../../constants/dashboard";
import type { DashboardKpis } from "../../types/dashboard";
import styles from "./dashboard-panel.module.css";

interface KpiGridProps {
  kpis: DashboardKpis;
}

export function KpiGrid({ kpis }: KpiGridProps) {
  const { t } = useTranslation();

  return (
    <section
      className={styles.kpiGrid}
      aria-label={t("dashboard.kpiAriaLabel")}
    >
      {KPI_DEFINITIONS.map(({ key, tone, icon: Icon }) => (
        <article className={styles.kpiCard} key={key}>
          <div className={styles.kpiHeader}>
            <span>{t(`dashboard.kpis.${key}.label`)}</span>
            <Icon size={17} />
          </div>

          <div className={styles.kpiValue}>
            {kpis[key]}
            <small>
              {t(`dashboard.kpis.${key}.unit`, { count: kpis[key] })}
            </small>
          </div>

          <div className={`${styles.kpiFooter} ${styles[tone]}`}>
            {t(`dashboard.kpis.${key}.detail`)}
          </div>
        </article>
      ))}
    </section>
  );
}
import { useTranslation } from "react-i18next";
