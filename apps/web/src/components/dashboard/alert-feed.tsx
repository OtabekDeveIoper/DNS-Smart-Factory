import { DASHBOARD_ALERTS } from "../../data/dashboard.mock";
import { formatTime } from "../../lib/helpers";
import styles from "./dashboard-panel.module.css";

const severityStyles = {
  INFO: styles.severityInfo,
  WARNING: styles.severityWarning,
  CRITICAL: styles.severityCritical,
};

export function AlertFeed() {
  return (
    <ul className={styles.alertFeed}>
      {DASHBOARD_ALERTS.map((alert) => (
        <li className={styles.alertItem} key={alert.id}>
          <span
            className={`${styles.severityDot} ${severityStyles[alert.severity]}`}
          />
          <time>{formatTime(alert.occurredAt).slice(-8)}</time>
          <span>
            {alert.title} — {alert.message}
          </span>
        </li>
      ))}
    </ul>
  );
}
