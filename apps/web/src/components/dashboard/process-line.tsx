import { PROCESS_STATUS_LABELS } from "../../constants/dashboard";
import { PROCESS_LABELS } from "../../constants/processes";
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
  if (items.length === 0) {
    return (
      <div className={styles.emptyFeed}>표시할 공정 데이터가 없습니다.</div>
    );
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
              {PROCESS_LABELS[process.code] ?? process.name}
            </span>

            <div className={styles.stationCount}>
              {process.completed}
              <small> 건</small>
            </div>

            <div className={styles.stationState}>
              {PROCESS_STATUS_LABELS[process.status]} · 완료율{" "}
              {process.completionRate}%
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
