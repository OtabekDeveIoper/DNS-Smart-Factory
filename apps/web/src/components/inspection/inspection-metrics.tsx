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
  const { t } = useTranslation();
  const detectedCount = targets.filter((target) => {
    const result = target.latestInspection?.result;

    return result === "FAIL" || result === "REVIEW";
  }).length;

  return (
    <div className={styles.metrics}>
      <article>
        <span>{t("inspection.metrics.available")}</span>
        <strong>
          {targets.length}
          <small>
            {t("inspection.metrics.panelUnit", { count: targets.length })}
          </small>
        </strong>
      </article>

      <article>
        <span>{t("inspection.metrics.detected")}</span>
        <strong>
          {detectedCount}
          <small>
            {t("inspection.metrics.countUnit", { count: detectedCount })}
          </small>
        </strong>
      </article>

      <article>
        <span>{t("inspection.metrics.confidence")}</span>
        <strong>
          {confidence ?? "-"}
          {confidence !== null ? <small> %</small> : null}
        </strong>
      </article>
    </div>
  );
}
import { useTranslation } from "react-i18next";
