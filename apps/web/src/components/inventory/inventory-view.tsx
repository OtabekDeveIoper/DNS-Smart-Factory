import { MATERIAL_CARDS, MATERIAL_FORECASTS } from "../../data/inventory.mock";
import type { InventoryStatus } from "../../types/inventory";
import { DataTable } from "../ui/data-table";
import { Panel } from "../ui/panel";
import { StatusBadge, type StatusTone } from "../ui/status-badge";
import styles from "./inventory-view.module.css";

const statusTones: Record<InventoryStatus, StatusTone> = {
  충분: "success",
  주의: "warning",
  결품: "danger",
};

export function InventoryView() {
  return (
    <div className={styles.view}>
      <Panel
        title="주요 자재 현황"
        subtitle="수주 BOM과 연동 — 결품·과잉을 발주 전에 계산"
      >
        <div className={styles.materialGrid}>
          {MATERIAL_CARDS.map((material) => (
            <article className={styles.materialCard} key={material.name}>
              <span>{material.name}</span>
              <strong>
                {material.quantity}
                <small>{material.unit}</small>
              </strong>
              <div className={styles.progressTrack}>
                <span
                  className={
                    styles[
                      material.status === "결품"
                        ? "dangerBar"
                        : material.status === "주의"
                          ? "warningBar"
                          : "successBar"
                    ]
                  }
                  style={{ width: `${material.level}%` }}
                />
              </div>
              <p
                className={
                  material.status === "결품"
                    ? styles.dangerText
                    : material.status === "주의"
                      ? styles.warningText
                      : undefined
                }
              >
                {material.caption}
              </p>
            </article>
          ))}
        </div>
      </Panel>
      <Panel
        title="AI 소요 예측 (주간)"
        subtitle="확정 수주 + 진행 견적 가중치 반영"
      >
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
            {MATERIAL_FORECASTS.map((row) => (
              <tr key={row.material}>
                <td>{row.material}</td>
                <td className={styles.mono}>{row.currentStock}</td>
                <td className={styles.mono}>{row.demand}</td>
                <td>
                  <StatusBadge tone={statusTones[row.status]}>
                    {row.shortage ?? row.status}
                  </StatusBadge>
                </td>
                <td>{row.suggestion}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
    </div>
  );
}
