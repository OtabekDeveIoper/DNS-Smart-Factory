"use client";

import {
  ORDER_STATUS_TONES,
  RISKY_ORDER_STATUSES,
} from "../../constants/orders";
import { useOrders } from "../../lib/use-orders";
import { DataTable } from "../ui/data-table";
import { Panel } from "../ui/panel";
import { StatusBadge } from "../ui/status-badge";
import styles from "./orders-view.module.css";
import {
  presentOrder,
  selectMostCriticalOrder,
} from "../../lib/order-presenter";
import { DeliveryRiskPanel } from "./delivery-risk-panel";

export function OrdersView() {
  const { data, error, isLoading } = useOrders();

  if (isLoading && !data) {
    return (
      <Panel title="호기별 진척 관제" subtitle="수주 데이터를 불러오는 중">
        <div className={styles.state}>수주 정보를 불러오고 있습니다.</div>
      </Panel>
    );
  }

  if (error || !data) {
    return (
      <Panel title="호기별 진척 관제" subtitle="API 연결 오류">
        <div className={`${styles.state} ${styles.errorState}`}>
          {error instanceof Error
            ? error.message
            : "수주 정보를 불러오지 못했습니다."}
        </div>
      </Panel>
    );
  }

  const orders = data.map(presentOrder);
  const criticalOrder = selectMostCriticalOrder(data);
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
            {orders.length === 0 ? (
              <tr>
                <td className={styles.emptyState} colSpan={7}>
                  등록된 수주 정보가 없습니다.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.orderNo}>
                  <td className={styles.mono}>{order.orderNo}</td>
                  <td>{order.product}</td>
                  <td>{order.customer}</td>
                  <td className={styles.mono}>{order.dueDate}</td>
                  <td>
                    <div className={styles.progressTrack}>
                      <span
                        className={
                          RISKY_ORDER_STATUSES.has(order.status)
                            ? styles.warningProgress
                            : styles.normalProgress
                        }
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </td>
                  <td>{order.currentProcess}</td>
                  <td>
                    <StatusBadge tone={ORDER_STATUS_TONES[order.status]}>
                      {order.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </DataTable>
      </Panel>
      <DeliveryRiskPanel order={criticalOrder} />
    </div>
  );
}
