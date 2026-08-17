import { Panel } from "../ui/panel";
import { AlertFeed } from "./alert-feed";
import { KpiGrid } from "./kpi-grid";
import { ProcessLine } from "./process-line";
import { WeeklyChart } from "./weekly-chart";
import styles from "./dashboard-panel.module.css";

export function DashboardPanel() {
  return (
    <div className={styles.dashboardView}>
      <KpiGrid />
      <Panel
        title="라인 현황"
        subtitle="공정별 실적이 작업 단말·IoT 센서에서 자동 집계됩니다 — 수기 집계 0"
      >
        <ProcessLine />
      </Panel>
      <div className={styles.dashboardGrid}>
        <Panel title="주간 생산실적" subtitle="완료 공정 수 · 자동 집계">
          <WeeklyChart />
        </Panel>
        <Panel title="실시간 알림" subtitle="이상·임계 이벤트">
          <AlertFeed />
        </Panel>
      </div>
    </div>
  );
}
