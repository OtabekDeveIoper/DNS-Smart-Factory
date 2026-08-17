import { presentOrder } from "../../lib/order-presenter";
import type { OrderListItem } from "../../types/orders";
import { Panel } from "../ui/panel";
import styles from "./orders-view.module.css";

interface DeliveryRiskPanelProps {
  order: OrderListItem | null;
}

export function DeliveryRiskPanel({ order }: DeliveryRiskPanelProps) {
  const { i18n, t } = useTranslation();

  if (!order) {
    return (
      <Panel
        title={t("orders.risk.title")}
        subtitle={t("orders.risk.subtitle")}
      >
        <p className={styles.riskCopy}>{t("orders.risk.empty")}</p>
      </Panel>
    );
  }

  const row = presentOrder(order, t, i18n.resolvedLanguage);
  const risk = order.deliveryRisk;

  const marginText =
    risk.marginDays < 0
      ? t("orders.risk.marginShortage", {
          count: Math.abs(risk.marginDays),
        })
      : t("orders.risk.marginAvailable", { count: risk.marginDays });

  return (
    <Panel title={t("orders.risk.title")} subtitle={t("orders.risk.subtitle")}>
      <p className={styles.riskCopy}>
        <span className={styles.mono}>{order.orderNo}</span>
        {` ${t("orders.risk.detail", {
          product: row.product,
          remainingHours: risk.remainingStandardHours,
          productionDays: risk.productionDays,
          bufferDays: risk.bufferDays,
          requiredDays: risk.requiredDays,
          availableDays: risk.availableDays,
        })} `}
        <strong>{t("orders.risk.conclusion", { margin: marginText })}</strong>
      </p>
    </Panel>
  );
}
import { useTranslation } from "react-i18next";
