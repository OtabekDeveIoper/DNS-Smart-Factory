"use client";

import {
  ORDER_STATUS_TONES,
  RISKY_ORDER_STATUSES,
} from "../../constants/orders";
import { useTranslation } from "react-i18next";
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
import { useApiErrorMessage } from "../../lib/use-api-error-message";
import { AsyncState } from "../ui/async-state";

export function OrdersView() {
  const { i18n, t } = useTranslation();
  const getErrorMessage = useApiErrorMessage();
  const { data, error, isLoading, mutate } = useOrders();

  if (isLoading && !data) {
    return (
      <Panel title={t("orders.title")} subtitle={t("orders.loadingSubtitle")}>
        <AsyncState variant="loading" title={t("orders.loading")} />
      </Panel>
    );
  }

  if (error || !data) {
    return (
      <Panel
        title={t("orders.title")}
        subtitle={t("common.apiConnectionError")}
      >
        <AsyncState
          variant="error"
          title={t("orders.loadError")}
          message={getErrorMessage(error, t("common.retryMessage"))}
          onRetry={() => void mutate()}
        />
      </Panel>
    );
  }

  const orders = data.map((order) =>
    presentOrder(order, t, i18n.resolvedLanguage),
  );
  const criticalOrder = selectMostCriticalOrder(data);
  return (
    <div className={styles.view}>
      <Panel title={t("orders.title")} subtitle={t("orders.subtitle")}>
        <DataTable>
          <thead>
            <tr>
              <th>{t("orders.columns.orderNo")}</th>
              <th>{t("orders.columns.product")}</th>
              <th>{t("orders.columns.customer")}</th>
              <th>{t("orders.columns.dueDate")}</th>
              <th>{t("orders.columns.progress")}</th>
              <th>{t("orders.columns.currentProcess")}</th>
              <th>{t("orders.columns.status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td className={styles.emptyState} colSpan={7}>
                  {t("orders.empty")}
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
                      {t(`orders.status.${order.status}`)}
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
