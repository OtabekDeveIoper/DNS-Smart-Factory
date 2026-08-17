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
  const { t } = useTranslation();

  return (
    <label className={styles.orderField}>
      <span>{t("quality.orderSelect.label")}</span>

      <select
        value={selectedOrderNo}
        disabled={loading || orders.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        {loading ? (
          <option value="">{t("quality.orderSelect.loading")}</option>
        ) : null}

        {!loading && orders.length === 0 ? (
          <option value="">{t("quality.orderSelect.empty")}</option>
        ) : null}

        {orders.map((order) => (
          <option value={order.orderNo} key={order.id}>
            {order.orderNo} ·{" "}
            {t(`orders.products.${order.productName}`, {
              defaultValue: order.productName,
            })}{" "}
            · {t(`orders.status.${order.status}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
import { useTranslation } from "react-i18next";
