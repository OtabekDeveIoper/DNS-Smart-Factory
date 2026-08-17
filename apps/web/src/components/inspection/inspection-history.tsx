import {
  INSPECTION_RESULT_LABELS,
  INSPECTION_RESULT_TONES,
} from "../../constants/inspection";
import { formatTime } from "../../lib/helpers";
import type { UnitInspectionHistory } from "../../types/inspection";
import { StatusBadge } from "../ui/status-badge";
import styles from "./inspection-view.module.css";

interface InspectionHistoryProps {
  history: UnitInspectionHistory | undefined;
  loading: boolean;
  errorMessage: string | null;
}

export function InspectionHistory({
  history,
  loading,
  errorMessage,
}: InspectionHistoryProps) {
  return (
    <section className={styles.historySection}>
      <header className={styles.historyHeader}>
        <h3>검사 이력</h3>
        <span>{history?.serialNo ?? "호기 미선택"}</span>
      </header>

      {loading ? (
        <div className={styles.historyState}>검사 이력 불러오는 중...</div>
      ) : null}

      {errorMessage ? (
        <div className={`${styles.historyState} ${styles.failed}`}>
          {errorMessage}
        </div>
      ) : null}

      {!loading && !errorMessage && history?.inspections.length === 0 ? (
        <div className={styles.historyState}>저장된 검사 이력이 없습니다.</div>
      ) : null}

      {!loading &&
      !errorMessage &&
      history &&
      history.inspections.length > 0 ? (
        <ul className={styles.historyList}>
          {history.inspections.slice(0, 5).map((inspection) => (
            <li className={styles.historyItem} key={inspection.id}>
              <div className={styles.historyCopy}>
                <span>
                  {inspection.defectLocation ??
                    inspection.notes ??
                    inspection.inspectionType}
                </span>
                <small>
                  {inspection.cameraCode ?? "CAM 미지정"} ·{" "}
                  {inspection.inspectorName ?? "검사자 미지정"}
                </small>
              </div>

              <StatusBadge tone={INSPECTION_RESULT_TONES[inspection.result]}>
                {INSPECTION_RESULT_LABELS[inspection.result]}
              </StatusBadge>

              <div className={styles.historyMeta}>
                <strong>
                  {inspection.confidence === null
                    ? "-"
                    : `${inspection.confidence}%`}
                </strong>
                <time>{formatTime(inspection.inspectedAt)}</time>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
