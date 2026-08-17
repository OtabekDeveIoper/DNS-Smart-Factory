import type { OrderListItem } from "../../types/orders";
import styles from "./quality-view.module.css";

interface QualityOrderSelectProps {
  orders: OrderListItem[];
  selectedOrderNo: string;
  loading: boolean;
  onChange: (orderNo: string) => void;
}

export function QualityOrderSelect({
  orders,
  selectedOrderNo,
  loading,
  onChange,
}: QualityOrderSelectProps) {
  return (
    <label className={styles.orderField}>
      <span>추적 수주 선택</span>

      <select
        value={selectedOrderNo}
        disabled={loading || orders.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        {loading ? <option value="">수주 불러오는 중...</option> : null}

        {!loading && orders.length === 0 ? (
          <option value="">선택 가능한 수주가 없습니다.</option>
        ) : null}

        {orders.map((order) => (
          <option value={order.orderNo} key={order.id}>
            {order.orderNo} · {order.productName} · {order.status}
          </option>
        ))}
      </select>
    </label>
  );
}
