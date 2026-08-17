import { formatKoreanWeekday } from "../../lib/helpers";
import type { WeeklyPerformancePoint } from "../../types/dashboard";
import styles from "./dashboard-panel.module.css";

interface WeeklyChartProps {
  points: WeeklyPerformancePoint[];
}

export function WeeklyChart({ points }: WeeklyChartProps) {
  if (points.length === 0) {
    return <div className={styles.emptyFeed}>표시할 주간 실적이 없습니다.</div>;
  }

  const highestOutput = Math.max(...points.map((point) => point.completed), 1);

  const chartMaximum = Math.ceil(highestOutput / 10) * 10;

  return (
    <div className={styles.chartArea}>
      <div className={styles.barChart}>
        {points.map((item, index) => {
          const isToday = index === points.length - 1;
          const barHeight = (item.completed / chartMaximum) * 100;

          return (
            <div className={styles.barColumn} key={item.date}>
              <div className={isToday ? styles.todayValue : styles.barValue}>
                {item.completed}
              </div>

              <div className={styles.barStack}>
                <span
                  className={isToday ? styles.todayBar : styles.completedBar}
                  style={{
                    height: `${barHeight}%`,
                  }}
                />
              </div>

              <span className={styles.dayLabel}>
                {isToday ? "금일" : formatKoreanWeekday(item.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
