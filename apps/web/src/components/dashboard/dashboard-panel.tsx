"use client";

import {
  Activity,
  CalendarCheck,
  CircleAlert,
  Factory,
  Gauge,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useDashboard } from "../../lib/use-dashboard";
import { formatTime } from "@/lib/helpers";

export function DashboardPanel() {
  const { data, error, isLoading, isValidating, mutate } = useDashboard();

  if (isLoading && !data) {
    return (
      <div className="dashboard-skeleton" aria-label="Loading dashboard">
        <div className="skeleton-kpis">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="skeleton-block" key={index} />
          ))}
        </div>

        <div className="skeleton-panel" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <section className="error-panel">
        <CircleAlert size={28} />

        <div>
          <h2>Factory API unavailable</h2>
          <p>Dashboard data could not be loaded.</p>
        </div>

        <button
          type="button"
          className="icon-button"
          title="Retry request"
          onClick={() => mutate()}
        >
          <RefreshCw size={18} />
        </button>
      </section>
    );
  }

  return (
    <div className="dashboard-view">
      <section className="kpi-grid" aria-label="Production KPIs">
        {kpiConfig.map((item) => {
          const Icon = item.icon;
          const value = data.kpis[item.key];

          return (
            <article className="kpi-card" key={item.key}>
              <div className="kpi-header">
                <span>{item.label}</span>
                <Icon size={17} />
              </div>

              <div className="kpi-value">
                {value}
                <small>{item.unit}</small>
              </div>

              <div className="kpi-footer">
                <span className="live-dot" />
                Live MES aggregate
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel process-panel">
        <header className="panel-header">
          <div>
            <span className="eyebrow">PRODUCTION FLOW</span>
            <h2>Process line status</h2>
          </div>

          <div className="sync-state">
            <RefreshCw
              size={14}
              className={isValidating ? "spinning" : undefined}
            />

            <span>Updated {formatTime(data.kpis.generatedAt)}</span>
          </div>
        </header>

        <div className="process-line">
          {data.processLine.map((process, index) => (
            <div className="process-group" key={process.id}>
              <article
                className={[
                  "process-station",
                  `station-${process.status.toLowerCase()}`,
                ].join(" ")}
              >
                <div className="station-topline">
                  <span className="sequence">
                    {String(process.sequence).padStart(2, "0")}
                  </span>

                  <span
                    className={[
                      "status-pill",
                      `status-${process.status.toLowerCase()}`,
                    ].join(" ")}
                  >
                    {process.status}
                  </span>
                </div>

                <h3>{process.name}</h3>

                <div className="station-count">
                  {process.completed}
                  <small> / {process.total} completed</small>
                </div>

                <div className="station-meta">
                  <span>{process.inProgress} active</span>
                  <span>{process.completionRate}%</span>
                </div>

                <div className="progress-track">
                  <span
                    style={{
                      width: `${Math.min(process.completionRate, 100)}%`,
                    }}
                  />
                </div>
              </article>

              {index < data.processLine.length - 1 ? (
                <div className="process-connector">
                  <span />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const kpiConfig = [
  {
    key: "todayOutput",
    label: "Today's process output",
    unit: "ops",
    icon: Activity,
  },
  {
    key: "activeUnits",
    label: "Active units",
    unit: "units",
    icon: Factory,
  },
  {
    key: "onTimeDeliveryRate",
    label: "On-time delivery",
    unit: "%",
    icon: CalendarCheck,
  },
  {
    key: "weeklyRework",
    label: "Weekly rework",
    unit: "cases",
    icon: RotateCcw,
  },
  {
    key: "equipmentUtilization",
    label: "Equipment utilization",
    unit: "%",
    icon: Gauge,
  },
] as const;
