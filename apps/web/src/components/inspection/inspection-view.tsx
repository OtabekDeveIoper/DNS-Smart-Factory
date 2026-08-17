"use client";

import { Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useApiErrorMessage } from "../../lib/use-api-error-message";

export function InspectionView() {
  const { t } = useTranslation();
  const getErrorMessage = useApiErrorMessage();
  const [phase, setPhase] = useState<InspectionPhase>("idle");

  const [result, setResult] = useState<AnalyzeInspectionResponse | null>(null);

  const [requestError, setRequestError] = useState<unknown>(null);
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

      setRequestError(error);

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
    <Panel title={t("inspection.title")} subtitle={t("inspection.subtitle")}>
      <div className={styles.layout}>
        <WiringViewer
          scanning={phase === "scanning"}
          detected={
            phase === "complete" &&
            result !== null &&
            result.inspection.result !== "PASS"
          }
          serialNo={selectedTarget?.serialNo ?? t("inspection.noTarget")}
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
              {getErrorMessage(targetsError, t("inspection.target.loadError"))}
            </p>
          ) : null}
          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={phase === "scanning" || !selectedTarget}
              onClick={runInspection}
            >
              <Play size={16} fill="currentColor" />
              {t("inspection.actions.run")}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={resetInspection}
              title={t("inspection.actions.reset")}
              disabled={phase === "scanning"}
            >
              <RotateCcw size={16} /> {t("inspection.actions.reset")}
            </button>
          </div>
          <p className={styles.message}>
            {phase === "idle" ? t("inspection.phase.idle") : null}

            {phase === "scanning" ? t("inspection.phase.scanning") : null}

            {phase === "complete" && result
              ? t("inspection.phase.complete", {
                  serialNo: result.unit.serialNo,
                })
              : null}

            {phase === "error" ? (
              <span className={styles.failed}>
                {getErrorMessage(
                  requestError,
                  t("inspection.phase.requestError"),
                )}
              </span>
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
              historyError
                ? getErrorMessage(historyError, t("common.retryMessage"))
                : null
            }
          />
        </div>
      </div>
    </Panel>
  );
}
