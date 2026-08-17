import { INSPECTION_RESULT_TONES } from "../../constants/inspection";
import { useTranslation } from "react-i18next";
import { formatTime } from "../../lib/helpers";
import { presentInspectionData } from "../../lib/inspection-presenter";
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
  const { i18n, t } = useTranslation();

  return (
    <section className={styles.historySection}>
      <header className={styles.historyHeader}>
        <h3>{t("inspection.history.title")}</h3>
        <span>{history?.serialNo ?? t("inspection.history.noUnit")}</span>
      </header>

      {loading ? (
        <div className={styles.historyState}>
          {t("inspection.history.loading")}
        </div>
      ) : null}

      {errorMessage ? (
        <div className={`${styles.historyState} ${styles.failed}`}>
          {errorMessage}
        </div>
      ) : null}

      {!loading && !errorMessage && history?.inspections.length === 0 ? (
        <div className={styles.historyState}>
          {t("inspection.history.empty")}
        </div>
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
                  {presentInspectionData(
                    inspection.defectLocation ??
                      inspection.notes ??
                      inspection.inspectionType,
                    t,
                  )}
                </span>
                <small>
                  {inspection.cameraCode ??
                    t("inspection.history.cameraUnknown")}{" "}
                  ·{" "}
                  {inspection.inspectorName ??
                    t("inspection.history.inspectorUnknown")}
                </small>
              </div>

              <StatusBadge tone={INSPECTION_RESULT_TONES[inspection.result]}>
                {t(`inspection.result.${inspection.result}`)}
              </StatusBadge>

              <div className={styles.historyMeta}>
                <strong>
                  {inspection.confidence === null
                    ? "-"
                    : `${inspection.confidence}%`}
                </strong>
                <time>
                  {formatTime(inspection.inspectedAt, i18n.resolvedLanguage)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
