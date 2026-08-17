import { ORDER_ROWS } from "../../data/orders.mock";
import type { OrderUiStatus } from "../../types/orders";
import { DataTable } from "../ui/data-table";
import { Panel } from "../ui/panel";
import { StatusBadge, type StatusTone } from "../ui/status-badge";
import styles from "./orders-view.module.css";

const statusTones: Record<OrderUiStatus, StatusTone> = {
  정상: "success",
  지연주의: "warning",
  "자재 발주중": "muted",
  완료: "info",
};

export function OrdersView() {
  return (
    <div className={styles.view}>
      <Panel
        title="호기별 진척 관제"
        subtitle="수주–설계–자재–생산–시험이 한 화면 · 납기 역산 자동 경보"
      >
        <DataTable>
          <thead>
            <tr>
              <th>수주번호</th>
              <th>품목</th>
              <th>수요처</th>
              <th>납기</th>
              <th>공정 진척</th>
              <th>현재 공정</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {ORDER_ROWS.map((order) => (
              <tr key={order.orderNo}>
                <td className={styles.mono}>{order.orderNo}</td>
                <td>{order.product}</td>
                <td>{order.customer}</td>
                <td className={styles.mono}>{order.dueDate}</td>
                <td>
                  <div className={styles.progressTrack}>
                    <span
                      className={
                        order.status === "지연주의"
                          ? styles.warningProgress
                          : styles.normalProgress
                      }
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </td>
                <td>{order.currentProcess}</td>
                <td>
                  <StatusBadge tone={statusTones[order.status]}>
                    {order.status}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
      <Panel
        title="납기 역산 경보 로직"
        subtitle="공정 표준시간 × 잔여 공정으로 지연 위험을 사전 감지"
      >
        <p className={styles.riskCopy}>
          DN-2607-014(MCC 3면): 배선 공정 잔여 3.5일 + 시험 1일 + 여유 1일 =
          최소 5.5일 필요 → 납기 D-12 대비
          <strong> 여유 6.5일, 배선 인력 1명 증원 시 정상화</strong>. 지금은 이
          계산을 사람이 머릿속으로 합니다 — 시스템이 매시간 자동으로 다시
          계산합니다.
        </p>
      </Panel>
    </div>
  );
}
