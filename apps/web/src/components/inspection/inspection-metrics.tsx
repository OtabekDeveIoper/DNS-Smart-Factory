import type { InspectionTarget } from "../../types/inspection";
import styles from "./inspection-view.module.css";

interface InspectionMetricsProps {
  targets: InspectionTarget[];
  confidence: number | null;
}

export function InspectionMetrics({
  targets,
  confidence,
}: InspectionMetricsProps) {
  const detectedCount = targets.filter((target) => {
    const result = target.latestInspection?.result;

    return result === "FAIL" || result === "REVIEW";
  }).length;

  return (
    <div className={styles.metrics}>
      <article>
        <span>검사 가능</span>
        <strong>
          {targets.length}
          <small> 면</small>
        </strong>
      </article>

      <article>
        <span>이상 검출</span>
        <strong>
          {detectedCount}
          <small> 건</small>
        </strong>
      </article>

      <article>
        <span>선택 신뢰도</span>
        <strong>
          {confidence ?? "-"}
          {confidence !== null ? <small> %</small> : null}
        </strong>
      </article>
    </div>
  );
}
