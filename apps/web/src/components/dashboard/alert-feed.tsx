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
  if (alerts.length === 0) {
    return <div className={styles.emptyFeed}>최근 알림이 없습니다.</div>;
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

          <time>{formatTime(alert.occurredAt).slice(-8)}</time>

          <span>
            {alert.title}
            {alert.message ? ` — ${alert.message}` : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
