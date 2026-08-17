import { presentOrder } from "../../lib/order-presenter";
import type { OrderListItem } from "../../types/orders";
import { Panel } from "../ui/panel";
import styles from "./orders-view.module.css";

interface DeliveryRiskPanelProps {
  order: OrderListItem | null;
}

export function DeliveryRiskPanel({ order }: DeliveryRiskPanelProps) {
  if (!order) {
    return (
      <Panel
        title="납기 역산 경보 로직"
        subtitle="공정 표준시간 × 잔여 공정으로 지연 위험을 사전 감지"
      >
        <p className={styles.riskCopy}>현재 계산할 진행 수주가 없습니다.</p>
      </Panel>
    );
  }

  const row = presentOrder(order);
  const risk = order.deliveryRisk;

  const marginText =
    risk.marginDays < 0
      ? `${Math.abs(risk.marginDays)}일 부족`
      : `${risk.marginDays}일 여유`;

  return (
    <Panel
      title="납기 역산 경보 로직"
      subtitle="공정 표준시간 × 잔여 공정으로 지연 위험을 사전 감지"
    >
      <p className={styles.riskCopy}>
        <span className={styles.mono}>{order.orderNo}</span>
        {` (${row.product}): 잔여 표준공수 ${risk.remainingStandardHours}시간 → `}
        {`생산 ${risk.productionDays}일 + 버퍼 ${risk.bufferDays}일 = `}
        {`최소 ${risk.requiredDays}일 필요. 납기까지 ${risk.availableDays}일 남았으며, `}
        <strong>현재 계산상 {marginText}입니다.</strong>
      </p>
    </Panel>
  );
}
