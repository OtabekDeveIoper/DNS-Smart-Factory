import {
  QUALITY_RESULT_LABELS,
  QUALITY_RESULT_TONES,
} from "../../constants/quality";
import type { QualityTestViewModel } from "../../types/quality";
import { DataTable } from "../ui/data-table";
import { StatusBadge } from "../ui/status-badge";
import styles from "./quality-view.module.css";

interface QualityTestTableProps {
  rows: QualityTestViewModel[];
}

export function QualityTestTable({ rows }: QualityTestTableProps) {
  return (
    <DataTable>
      <thead>
        <tr>
          <th>호기</th>
          <th>시험항목</th>
          <th>측정값</th>
          <th>기준</th>
          <th>판정</th>
          <th>시험자 / 일시</th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className={styles.emptyState} colSpan={6}>
              저장된 시험 결과가 없습니다.
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
                  {QUALITY_RESULT_LABELS[row.result]}
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
