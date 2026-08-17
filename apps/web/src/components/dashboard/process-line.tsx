import { PROCESS_DETAILS } from "../../constants/dashboard";
import { PROCESS_LINE } from "../../data/dashboard.mock";
import styles from "./dashboard-panel.module.css";

const stationStyles = {
  RUNNING: styles.stationRunning,
  BLOCKED: styles.stationBlocked,
  IDLE: styles.stationIdle,
};

export function ProcessLine() {
  return (
    <div className={styles.processLine}>
      {PROCESS_LINE.map((process, index) => (
        <div className={styles.processGroup} key={process.id}>
          <article
            className={`${styles.processStation} ${stationStyles[process.status]}`}
          >
            <span className={styles.processName}>{process.name}</span>
            <div className={styles.stationCount}>
              {process.completed}
              <small> 건</small>
            </div>
            <div className={styles.stationState}>
              {PROCESS_DETAILS[process.code]}
            </div>
          </article>
          {index < PROCESS_LINE.length - 1 ? (
            <div className={styles.processConnector}>
              <span />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
