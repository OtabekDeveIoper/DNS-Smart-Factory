import { INVENTORY_STATUS_TONES } from "../../constants/inventory";
import type { InventoryForecastRow } from "../../types/inventory";
import { DataTable } from "../ui/data-table";
import { StatusBadge } from "../ui/status-badge";
import styles from "./inventory-view.module.css";

interface InventoryForecastTableProps {
  rows: InventoryForecastRow[];
}

export function InventoryForecastTable({ rows }: InventoryForecastTableProps) {
  return (
    <DataTable>
      <thead>
        <tr>
          <th>자재</th>
          <th>현재고</th>
          <th>2주 내 소요</th>
          <th>판정</th>
          <th>제안</th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className={styles.emptyState} colSpan={5}>
              표시할 재고 예측이 없습니다.
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id}>
              <td>{row.material}</td>
              <td className={styles.mono}>{row.currentStock}</td>
              <td className={styles.mono}>{row.demand}</td>
              <td>
                <StatusBadge tone={INVENTORY_STATUS_TONES[row.status]}>
                  {row.shortage ?? row.status}
                </StatusBadge>
              </td>
              <td>{row.suggestion}</td>
            </tr>
          ))
        )}
      </tbody>
    </DataTable>
  );
}
