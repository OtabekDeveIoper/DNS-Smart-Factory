import { useTranslation } from "react-i18next";
import { KNOWN_PROCESS_CODES } from "../../constants/processes";
import type { ProcessLineItem } from "../../types/dashboard";
import styles from "./dashboard-panel.module.css";

interface ProcessLineProps {
  items: ProcessLineItem[];
}

const stationStyles: Record<ProcessLineItem["status"], string> = {
  RUNNING: styles.stationRunning,
  BLOCKED: styles.stationBlocked,
  IDLE: styles.stationIdle,
};

export function ProcessLine({ items }: ProcessLineProps) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return <div className={styles.emptyFeed}>{t("dashboard.line.empty")}</div>;
  }

  return (
    <div className={styles.processLine}>
      {items.map((process, index) => (
        <div className={styles.processGroup} key={process.id}>
          <article
            className={`${styles.processStation} ${
              stationStyles[process.status]
            }`}
          >
            <span className={styles.processName}>
              {KNOWN_PROCESS_CODES.has(process.code)
                ? t(`processes.${process.code}`)
                : process.name}
            </span>

            <div className={styles.stationCount}>
              {t("dashboard.line.completedCount", {
                count: process.completed,
              })}
            </div>

            <div className={styles.stationState}>
              {t(`dashboard.processStatus.${process.status}`)} ·{" "}
              {t("dashboard.line.completionRate", {
                rate: process.completionRate,
              })}
            </div>
          </article>

          {index < items.length - 1 ? (
            <div className={styles.processConnector}>
              <span />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
