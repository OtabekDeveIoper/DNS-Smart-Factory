"use client";

import { Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { analyzeInspection } from "../../lib/inspection-api";
import type {
  AnalyzeInspectionResponse,
  InspectionPhase,
} from "../../types/inspection";
import { InspectionResultList } from "./inspection-result-list";
import { Panel } from "../ui/panel";
import { WiringViewer } from "./wiring-viewer";
import styles from "./inspection-view.module.css";
import { useInspectionTargets } from "../../lib/use-inspection-targets";
import { InspectionTargetSelect } from "./inspection-target-select";
import { InspectionMetrics } from "./inspection-metrics";
import { useInspectionHistory } from "../../lib/use-inspection-history";
import { InspectionHistory } from "./inspection-history";

export function InspectionView() {
  const [phase, setPhase] = useState<InspectionPhase>("idle");

  const [result, setResult] = useState<AnalyzeInspectionResponse | null>(null);

  const [requestError, setRequestError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: targets,
    error: targetsError,
    isLoading: targetsLoading,
    mutate,
  } = useInspectionTargets();

  const [selectedSerialNo, setSelectedSerialNo] = useState("");

  const availableTargets = targets ?? [];

  const selectedTarget =
    availableTargets.find((target) => target.serialNo === selectedSerialNo) ??
    availableTargets[0] ??
    null;

  const {
    data: history,
    error: historyError,
    isLoading: historyLoading,
    mutate: mutateHistory,
  } = useInspectionHistory(selectedTarget?.serialNo ?? null);

  const selectedConfidence =
    result?.inspection.confidence ??
    selectedTarget?.latestInspection?.confidence ??
    null;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const runInspection = async () => {
    if (!selectedTarget) {
      return;
    }

    setPhase("scanning");
    setResult(null);
    setRequestError(null);

    try {
      const scanDelay = new Promise<void>((resolve) => {
        timerRef.current = setTimeout(resolve, 1_900);
      });

      const [response] = await Promise.all([
        analyzeInspection({
          serialNo: selectedTarget.serialNo,
          cameraCode: "CAM-01",
          simulateDefect: true,
        }),
        scanDelay,
      ]);

      timerRef.current = null;
      setResult(response);
      setPhase("complete");

      void Promise.all([mutate(), mutateHistory()]);
    } catch (error) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setRequestError(
        error instanceof Error ? error.message : "AI 검사 요청에 실패했습니다.",
      );

      setPhase("error");
    }
  };

  const resetInspection = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setResult(null);
    setRequestError(null);
    setPhase("idle");
  };

  return (
    <Panel
      title="AI 배선·조립 검사"
      subtitle="SafeVision-X 온디바이스 비전 — 촬영 즉시 판독, 결과는 호기 이력에 자동 저장"
    >
      <div className={styles.layout}>
        <WiringViewer
          scanning={phase === "scanning"}
          detected={
            phase === "complete" &&
            result !== null &&
            result.inspection.result !== "PASS"
          }
          serialNo={selectedTarget?.serialNo ?? "검사 대상 미선택"}
          confidence={selectedConfidence}
        />
        <div className={styles.controls}>
          <InspectionTargetSelect
            targets={availableTargets}
            selectedSerialNo={selectedTarget?.serialNo ?? ""}
            disabled={phase === "scanning"}
            loading={targetsLoading}
            onChange={(serialNo) => {
              setSelectedSerialNo(serialNo);
              resetInspection();
            }}
          />

          {targetsError ? (
            <p className={styles.targetError}>
              {targetsError instanceof Error
                ? targetsError.message
                : "검사 대상을 불러오지 못했습니다."}
            </p>
          ) : null}
          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={phase === "scanning" || !selectedTarget}
              onClick={runInspection}
            >
              <Play size={16} fill="currentColor" /> AI 검사 실행 (시연)
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={resetInspection}
              title="초기화"
              disabled={phase === "scanning"}
            >
              <RotateCcw size={16} /> 초기화
            </button>
          </div>
          <p className={styles.message}>
            {phase === "idle"
              ? "검사 대기 중 — 대상 호기를 선택하고 AI 검사를 실행해 주세요."
              : null}

            {phase === "scanning" ? "촬영 → 온디바이스 추론 중…" : null}

            {phase === "complete" && result
              ? `판독 완료 — 결과가 호기 ${result.unit.serialNo} 품질 이력에 저장되었습니다.`
              : null}

            {phase === "error" ? (
              <span className={styles.failed}>{requestError}</span>
            ) : null}
          </p>
          {phase === "complete" && result ? (
            <InspectionResultList inspection={result.inspection} />
          ) : null}
          <InspectionMetrics
            targets={availableTargets}
            confidence={selectedConfidence}
          />
          <InspectionHistory
            history={history}
            loading={historyLoading}
            errorMessage={
              historyError instanceof Error ? historyError.message : null
            }
          />
        </div>
      </div>
    </Panel>
  );
}
