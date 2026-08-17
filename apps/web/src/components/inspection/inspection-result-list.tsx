import type { AnalyzeInspectionResponse } from "../../types/inspection";
import styles from "./inspection-view.module.css";

interface InspectionResultListProps {
  inspection: AnalyzeInspectionResponse["inspection"];
}

export function InspectionResultList({
  inspection,
}: InspectionResultListProps) {
  const failed = inspection.result !== "PASS";

  const description =
    inspection.defectLocation && inspection.defectType
      ? `${inspection.defectType} · ${inspection.defectLocation}`
      : (inspection.notes ?? "배선 검사가 완료되었습니다.");

  const resultLabel =
    inspection.result === "FAIL"
      ? "오결선 의심"
      : inspection.result === "REVIEW"
        ? "검토 필요"
        : "PASS";

  return (
    <ul className={styles.results}>
      <li>
        <span>{description}</span>

        <strong className={failed ? styles.failed : styles.passed}>
          {resultLabel}
        </strong>

        <small>
          {inspection.confidence === null ? "-" : `${inspection.confidence}%`}
        </small>
      </li>
    </ul>
  );
}
