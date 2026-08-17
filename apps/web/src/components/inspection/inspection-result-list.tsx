import type { AnalyzeInspectionResponse } from "../../types/inspection";
import styles from "./inspection-view.module.css";

interface InspectionResultListProps {
  inspection: AnalyzeInspectionResponse["inspection"];
}

export function InspectionResultList({
  inspection,
}: InspectionResultListProps) {
  const { t } = useTranslation();
  const failed = inspection.result !== "PASS";

  const description =
    inspection.defectLocation && inspection.defectType
      ? `${presentInspectionData(inspection.defectType, t)} · ${presentInspectionData(inspection.defectLocation, t)}`
      : (presentInspectionData(inspection.notes, t) ??
        t("inspection.result.complete"));

  return (
    <ul className={styles.results}>
      <li>
        <span>{description}</span>

        <strong className={failed ? styles.failed : styles.passed}>
          {t(`inspection.result.${inspection.result}`)}
        </strong>

        <small>
          {inspection.confidence === null ? "-" : `${inspection.confidence}%`}
        </small>
      </li>
    </ul>
  );
}
import { useTranslation } from "react-i18next";
import { presentInspectionData } from "../../lib/inspection-presenter";
