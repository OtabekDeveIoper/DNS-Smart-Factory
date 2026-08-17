"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  presentQualityTests,
  presentQualityTraceSteps,
} from "../../lib/quality-presenter";
import { useOrders } from "../../lib/use-orders";
import { useQualityTrace } from "../../lib/use-quality-trace";
import { Panel } from "../ui/panel";
import { QualityOrderSelect } from "./quality-order-select";
import { QualityTestTable } from "./quality-test-table";
import { TraceFlow } from "./trace-flow";
import styles from "./quality-view.module.css";
import { useApiErrorMessage } from "../../lib/use-api-error-message";
import { AsyncState } from "../ui/async-state";

export function QualityView() {
  const { i18n, t } = useTranslation();
  const getErrorMessage = useApiErrorMessage();
  const [selectedOrderNo, setSelectedOrderNo] = useState("");

  const {
    data: orders,
    error: ordersError,
    isLoading: ordersLoading,
    mutate: mutateOrders,
  } = useOrders();

  const availableOrders = orders ?? [];

  const selectedOrder =
    availableOrders.find((order) => order.orderNo === selectedOrderNo) ??
    availableOrders.find((order) => order.status === "COMPLETED") ??
    availableOrders[0] ??
    null;

  const {
    data: trace,
    error: traceError,
    isLoading: traceLoading,
    mutate: mutateTrace,
  } = useQualityTrace(selectedOrder?.orderNo ?? null);

  if (ordersLoading && !orders) {
    return (
      <Panel
        title={t("quality.title")}
        subtitle={t("quality.ordersLoadingSubtitle")}
      >
        <AsyncState variant="loading" title={t("quality.ordersLoading")} />
      </Panel>
    );
  }

  if (ordersError) {
    return (
      <Panel
        title={t("quality.title")}
        subtitle={t("common.apiConnectionError")}
      >
        <AsyncState
          variant="error"
          title={t("quality.ordersLoadError")}
          message={getErrorMessage(ordersError, t("common.retryMessage"))}
          onRetry={() => void mutateOrders()}
        />
      </Panel>
    );
  }

  const testRows = trace
    ? presentQualityTests(trace, t, i18n.resolvedLanguage)
    : [];
  const traceSteps = trace
    ? presentQualityTraceSteps(trace, t, i18n.resolvedLanguage)
    : [];

  return (
    <div className={styles.view}>
      <QualityOrderSelect
        orders={availableOrders}
        selectedOrderNo={selectedOrder?.orderNo ?? ""}
        loading={ordersLoading}
        onChange={setSelectedOrderNo}
      />

      <Panel title={t("quality.title")} subtitle={t("quality.testsSubtitle")}>
        {traceLoading ? (
          <AsyncState variant="loading" title={t("quality.historyLoading")} />
        ) : null}

        {traceError ? (
          <AsyncState
            variant="error"
            title={t("quality.historyLoadError")}
            message={getErrorMessage(traceError, t("common.retryMessage"))}
            onRetry={() => void mutateTrace()}
          />
        ) : null}

        {!traceLoading && !traceError ? (
          <QualityTestTable rows={testRows} />
        ) : null}
      </Panel>

      <Panel
        title={t("quality.traceTitle")}
        subtitle={t("quality.traceSubtitle")}
      >
        {traceLoading ? (
          <AsyncState variant="loading" title={t("quality.traceLoading")} />
        ) : null}

        {traceError ? (
          <AsyncState
            variant="error"
            title={t("quality.traceLoadError")}
            message={getErrorMessage(traceError, t("common.retryMessage"))}
            onRetry={() => void mutateTrace()}
          />
        ) : null}

        {!traceLoading && !traceError ? (
          <>
            <TraceFlow steps={traceSteps} />

            <p className={styles.traceNote}>{t("quality.traceNote")}</p>
          </>
        ) : null}
      </Panel>
    </div>
  );
}
