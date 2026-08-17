import { formatTime } from "../../lib/helpers";
import type { DashboardAlert } from "../../types/dashboard";
import styles from "./dashboard-panel.module.css";

interface AlertFeedProps {
  alerts: DashboardAlert[];
}

const severityStyles: Record<DashboardAlert["severity"], string> = {
  INFO: styles.severityInfo,
  WARNING: styles.severityWarning,
  CRITICAL: styles.severityCritical,
};

export function AlertFeed({ alerts }: AlertFeedProps) {
  const { i18n, t } = useTranslation();

  if (alerts.length === 0) {
    return (
      <div className={styles.emptyFeed}>{t("dashboard.alerts.empty")}</div>
    );
  }

  return (
    <ul className={styles.alertFeed}>
      {alerts.map((alert) => (
        <li className={styles.alertItem} key={alert.id}>
          <span
            className={`${styles.severityDot} ${
              severityStyles[alert.severity]
            }`}
          />

          <time>
            {formatTime(alert.occurredAt, i18n.resolvedLanguage).slice(-8)}
          </time>

          <span>
            {t(`dashboard.alertTypes.${alert.type}.title`, {
              defaultValue: alert.title,
            })}
            {alert.message
              ? ` — ${t(`dashboard.alertTypes.${alert.type}.message`, {
                  defaultValue: alert.message,
                })}`
              : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
import { useTranslation } from "react-i18next";
