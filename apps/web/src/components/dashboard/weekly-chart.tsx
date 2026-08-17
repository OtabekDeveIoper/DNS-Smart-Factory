import { useTranslation } from "react-i18next";
import { formatWeekday } from "../../lib/helpers";
import type { WeeklyPerformancePoint } from "../../types/dashboard";
import styles from "./dashboard-panel.module.css";

interface WeeklyChartProps {
  points: WeeklyPerformancePoint[];
}

export function WeeklyChart({ points }: WeeklyChartProps) {
  const { i18n, t } = useTranslation();

  if (points.length === 0) {
    return (
      <div className={styles.emptyFeed}>{t("dashboard.weekly.empty")}</div>
    );
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
                {isToday
                  ? t("dashboard.weekly.today")
                  : formatWeekday(item.date, i18n.resolvedLanguage)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
