"use client";

import { Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { INSPECTION_RESULTS } from "../../data/inspection.mock";
import { Panel } from "../ui/panel";
import { WiringViewer } from "./wiring-viewer";
import styles from "./inspection-view.module.css";

export function InspectionView() {
  const [phase, setPhase] = useState<"idle" | "scanning" | "complete">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const runInspection = () => {
    setPhase("scanning");
    timerRef.current = setTimeout(() => setPhase("complete"), 1900);
  };

  const resetInspection = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
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
          detected={phase === "complete"}
        />
        <div className={styles.controls}>
          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={phase === "scanning"}
              onClick={runInspection}
            >
              <Play size={16} fill="currentColor" /> AI 검사 실행 (시연)
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={resetInspection}
              title="초기화"
            >
              <RotateCcw size={16} /> 초기화
            </button>
          </div>
          <p className={styles.message}>
            {phase === "idle"
              ? "검사 대기 중 — 작업자가 태블릿·고정 카메라로 촬영하면 약 2초 내 판독됩니다."
              : null}
            {phase === "scanning" ? "촬영 → 온디바이스 추론 중…" : null}
            {phase === "complete"
              ? "판독 완료 (1.9초) — 결과가 호기 DN-2607-014 품질 이력에 저장되었습니다."
              : null}
          </p>
          {phase === "complete" ? (
            <ul className={styles.results}>
              {INSPECTION_RESULTS.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong
                    className={item.failed ? styles.failed : styles.passed}
                  >
                    {item.result}
                  </strong>
                  <small>{item.confidence}%</small>
                </li>
              ))}
            </ul>
          ) : null}
          <div className={styles.metrics}>
            <article>
              <span>금일 검사</span>
              <strong>
                {phase === "complete" ? 48 : 47}
                <small> 면</small>
              </strong>
            </article>
            <article>
              <span>검출</span>
              <strong>
                {phase === "complete" ? 4 : 3}
                <small> 건</small>
              </strong>
            </article>
            <article>
              <span>평균 판독</span>
              <strong>
                1.8<small> 초</small>
              </strong>
            </article>
          </div>
        </div>
      </div>
    </Panel>
  );
}
