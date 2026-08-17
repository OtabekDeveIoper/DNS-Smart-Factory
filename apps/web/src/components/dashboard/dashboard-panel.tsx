import { Panel } from "../ui/panel";
import { AlertFeed } from "./alert-feed";
import { KpiGrid } from "./kpi-grid";
import { ProcessLine } from "./process-line";
import { WeeklyChart } from "./weekly-chart";
import styles from "./dashboard-panel.module.css";
import { useDashboard } from "@/lib/use-dashboard";

export function DashboardPanel() {
  const { data, error, isLoading } = useDashboard();

  if (isLoading && !data) {
    return (
      <div className={styles.dashboardSkeleton}>
        <div className={styles.skeletonKpis}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div className={styles.skeletonBlock} key={index} />
          ))}
        </div>
        <div className={styles.skeletonPanel} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <section className={styles.errorPanel}>
        <div>
          <h2>데이터를 불러오지 못했습니다</h2>
          <p>
            {error instanceof Error
              ? error.message
              : "Dashboard API 응답을 확인해 주세요."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.dashboardView}>
      <KpiGrid kpis={data.kpis} />
      <Panel
        title="라인 현황"
        subtitle="공정별 실적이 작업 단말·IoT 센서에서 자동 집계됩니다 — 수기 집계 0"
      >
        <ProcessLine items={data.processLine} />
      </Panel>
      <div className={styles.dashboardGrid}>
        <Panel title="주간 생산실적" subtitle="완료 공정 수 · 자동 집계">
          <WeeklyChart points={data.weeklyPerformance} />
        </Panel>
        <Panel title="실시간 알림" subtitle="15초 자동 갱신 · 이상·임계 이벤트">
          <AlertFeed alerts={data.recentAlerts} />
        </Panel>
      </div>
    </div>
  );
}
