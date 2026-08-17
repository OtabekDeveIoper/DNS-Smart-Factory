import { INVENTORY_STATUS_TONES } from "../../constants/inventory";
import { useTranslation } from "react-i18next";
import type { InventoryForecastRow } from "../../types/inventory";
import { DataTable } from "../ui/data-table";
import { StatusBadge } from "../ui/status-badge";
import styles from "./inventory-view.module.css";

interface InventoryForecastTableProps {
  rows: InventoryForecastRow[];
}

export function InventoryForecastTable({ rows }: InventoryForecastTableProps) {
  const { t } = useTranslation();

  return (
    <DataTable>
      <thead>
        <tr>
          <th>{t("inventory.columns.material")}</th>
          <th>{t("inventory.columns.currentStock")}</th>
          <th>{t("inventory.columns.demand")}</th>
          <th>{t("inventory.columns.status")}</th>
          <th>{t("inventory.columns.suggestion")}</th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className={styles.emptyState} colSpan={5}>
              {t("inventory.emptyForecast")}
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
                  {row.shortage ?? t(`inventory.status.${row.status}`)}
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
