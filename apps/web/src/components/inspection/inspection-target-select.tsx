import type { InspectionTarget } from "../../types/inspection";
import styles from "./inspection-view.module.css";

interface InspectionTargetSelectProps {
  targets: InspectionTarget[];
  selectedSerialNo: string;
  disabled: boolean;
  loading: boolean;
  onChange: (serialNo: string) => void;
}

export function InspectionTargetSelect({
  targets,
  selectedSerialNo,
  disabled,
  loading,
  onChange,
}: InspectionTargetSelectProps) {
  const { t } = useTranslation();

  return (
    <label className={styles.targetField}>
      <span>{t("inspection.target.label")}</span>

      <select
        value={selectedSerialNo}
        disabled={disabled || loading || targets.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        {loading ? (
          <option value="">{t("inspection.target.loading")}</option>
        ) : null}

        {!loading && targets.length === 0 ? (
          <option value="">{t("inspection.target.empty")}</option>
        ) : null}

        {targets.map((target) => (
          <option value={target.serialNo} key={target.id}>
            {target.serialNo} · {target.order.orderNo} ·{" "}
            {target.latestInspection
              ? t(`inspection.result.${target.latestInspection.result}`)
              : t("inspection.target.notInspected")}
          </option>
        ))}
      </select>
    </label>
  );
}
import { useTranslation } from "react-i18next";
