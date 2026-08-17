import { useTranslation } from "react-i18next";
import { Panel } from "../ui/panel";
import { AlertFeed } from "./alert-feed";
import { KpiGrid } from "./kpi-grid";
import { ProcessLine } from "./process-line";
import { WeeklyChart } from "./weekly-chart";
import styles from "./dashboard-panel.module.css";
import { useDashboard } from "@/lib/use-dashboard";
import { useApiErrorMessage } from "../../lib/use-api-error-message";
import { AsyncState } from "../ui/async-state";

export function DashboardPanel() {
  const { t } = useTranslation();
  const getErrorMessage = useApiErrorMessage();
  const { data, error, isLoading, mutate } = useDashboard();

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
      <Panel
        title={t("dashboard.overviewTitle")}
        subtitle={t("common.apiConnectionError")}
      >
        <AsyncState
          variant="error"
          title={t("dashboard.error.title")}
          message={getErrorMessage(error, t("dashboard.error.fallback"))}
          onRetry={() => void mutate()}
        />
      </Panel>
    );
  }
  return (
    <div className={styles.dashboardView}>
      <KpiGrid kpis={data.kpis} />
      <Panel
        title={t("dashboard.line.title")}
        subtitle={t("dashboard.line.subtitle")}
      >
        <ProcessLine items={data.processLine} />
      </Panel>
      <div className={styles.dashboardGrid}>
        <Panel
          title={t("dashboard.weekly.title")}
          subtitle={t("dashboard.weekly.subtitle")}
        >
          <WeeklyChart points={data.weeklyPerformance} />
        </Panel>
        <Panel
          title={t("dashboard.alerts.title")}
          subtitle={t("dashboard.alerts.subtitle")}
        >
          <AlertFeed alerts={data.recentAlerts} />
        </Panel>
      </div>
    </div>
  );
}
