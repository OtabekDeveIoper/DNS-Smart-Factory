import { QUALITY_RESULT_TONES } from "../../constants/quality";
import { useTranslation } from "react-i18next";
import type { QualityTestViewModel } from "../../types/quality";
import { DataTable } from "../ui/data-table";
import { StatusBadge } from "../ui/status-badge";
import styles from "./quality-view.module.css";

interface QualityTestTableProps {
  rows: QualityTestViewModel[];
}

export function QualityTestTable({ rows }: QualityTestTableProps) {
  const { t } = useTranslation();

  return (
    <DataTable>
      <thead>
        <tr>
          <th>{t("quality.columns.unit")}</th>
          <th>{t("quality.columns.test")}</th>
          <th>{t("quality.columns.measured")}</th>
          <th>{t("quality.columns.standard")}</th>
          <th>{t("quality.columns.result")}</th>
          <th>{t("quality.columns.operatorTime")}</th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className={styles.emptyState} colSpan={6}>
              {t("quality.emptyTests")}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id}>
              <td className={styles.mono}>{row.unit}</td>
              <td>{row.testName}</td>
              <td className={styles.mono}>{row.measuredValue}</td>
              <td className={styles.mono}>{row.standard}</td>
              <td>
                <StatusBadge tone={QUALITY_RESULT_TONES[row.result]}>
                  {t(`quality.result.${row.result}`)}
                </StatusBadge>
              </td>
              <td className={styles.mono}>{row.operatorAndTime}</td>
            </tr>
          ))
        )}
      </tbody>
    </DataTable>
  );
}
