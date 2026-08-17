import { WEEKLY_PERFORMANCE } from "../../data/dashboard.mock";
import styles from "./dashboard-panel.module.css";

const MAX_OUTPUT = 150;

export function WeeklyChart() {
  return (
    <div className={styles.chartArea}>
      <div className={styles.barChart}>
        {WEEKLY_PERFORMANCE.map((item, index) => {
          const isToday = index === WEEKLY_PERFORMANCE.length - 1;
          return (
            <div className={styles.barColumn} key={item.date}>
              <div className={isToday ? styles.todayValue : styles.barValue}>
                {item.completed}
              </div>
              <div className={styles.barStack}>
                <span
                  className={isToday ? styles.todayBar : styles.completedBar}
                  style={{ height: `${(item.completed / MAX_OUTPUT) * 100}%` }}
                />
              </div>
              <span className={styles.dayLabel}>{item.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
