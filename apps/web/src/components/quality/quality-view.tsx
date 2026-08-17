"use client";

import { useState } from "react";
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

export function QualityView() {
  const [selectedOrderNo, setSelectedOrderNo] = useState("");

  const {
    data: orders,
    error: ordersError,
    isLoading: ordersLoading,
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
  } = useQualityTrace(selectedOrder?.orderNo ?? null);

  if (ordersError) {
    return (
      <Panel title="시험성적 전산화" subtitle="API 연결 오류">
        <div className={`${styles.state} ${styles.errorState}`}>
          {ordersError instanceof Error
            ? ordersError.message
            : "수주 정보를 불러오지 못했습니다."}
        </div>
      </Panel>
    );
  }

  const testRows = trace ? presentQualityTests(trace) : [];
  const traceSteps = trace ? presentQualityTraceSteps(trace) : [];

  return (
    <div className={styles.view}>
      <QualityOrderSelect
        orders={availableOrders}
        selectedOrderNo={selectedOrder?.orderNo ?? ""}
        loading={ordersLoading}
        onChange={setSelectedOrderNo}
      />

      <Panel
        title="시험성적 전산화"
        subtitle="절연저항·내전압·동작시험 결과 자동 수집"
      >
        {traceLoading ? (
          <div className={styles.state}>시험 결과를 불러오고 있습니다.</div>
        ) : null}

        {traceError ? (
          <div className={`${styles.state} ${styles.errorState}`}>
            {traceError instanceof Error
              ? traceError.message
              : "품질 이력을 불러오지 못했습니다."}
          </div>
        ) : null}

        {!traceLoading && !traceError ? (
          <QualityTestTable rows={testRows} />
        ) : null}
      </Panel>

      <Panel
        title="이력 추적 (Traceability)"
        subtitle="발주처 문의·클레임 시, 호기 번호 하나로 전 이력 3초 소환"
      >
        {traceLoading ? (
          <div className={styles.state}>추적 이력을 불러오고 있습니다.</div>
        ) : null}

        {traceError ? (
          <div className={`${styles.state} ${styles.errorState}`}>
            품질 추적 이력을 불러오지 못했습니다.
          </div>
        ) : null}

        {!traceLoading && !traceError ? <TraceFlow steps={traceSteps} /> : null}
        <p className={styles.traceNote}>
          호기 명판에 QR 부착 → 현장에서 스캔하면 준공 후에도 동일 이력 열람.
          유지보수·개보수 수주로 이어지는 접점이 됩니다.
        </p>
      </Panel>
    </div>
  );
}
