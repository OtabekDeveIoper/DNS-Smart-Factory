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
  return (
    <label className={styles.targetField}>
      <span>검사 대상 호기</span>

      <select
        value={selectedSerialNo}
        disabled={disabled || loading || targets.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        {loading ? <option value="">대상 불러오는 중...</option> : null}

        {!loading && targets.length === 0 ? (
          <option value="">검사 가능한 호기가 없습니다.</option>
        ) : null}

        {targets.map((target) => (
          <option value={target.serialNo} key={target.id}>
            {target.serialNo} · {target.order.orderNo} ·{" "}
            {target.latestInspection?.result ?? "미검사"}
          </option>
        ))}
      </select>
    </label>
  );
}
