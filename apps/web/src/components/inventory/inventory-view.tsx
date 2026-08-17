"use client";

import {
  presentInventoryCard,
  presentInventoryForecast,
} from "../../lib/inventory-presenter";
import { useTranslation } from "react-i18next";
import { useInventory } from "../../lib/use-inventory";
import { Panel } from "../ui/panel";
import { InventoryForecastTable } from "./inventory-forecast-table";
import { MaterialGrid } from "./material-grid";
import styles from "./inventory-view.module.css";
import { useApiErrorMessage } from "../../lib/use-api-error-message";
import { AsyncState } from "../ui/async-state";

export function InventoryView() {
  const { i18n, t } = useTranslation();
  const getErrorMessage = useApiErrorMessage();
  const { data, error, isLoading, mutate } = useInventory();

  if (isLoading && !data) {
    return (
      <Panel
        title={t("inventory.title")}
        subtitle={t("inventory.loadingSubtitle")}
      >
        <AsyncState variant="loading" title={t("inventory.loading")} />
      </Panel>
    );
  }

  if (error || !data) {
    return (
      <Panel
        title={t("inventory.title")}
        subtitle={t("common.apiConnectionError")}
      >
        <AsyncState
          variant="error"
          title={t("inventory.loadError")}
          message={getErrorMessage(error, t("common.retryMessage"))}
          onRetry={() => void mutate()}
        />
      </Panel>
    );
  }

  const materialCards = data.items.map((item) =>
    presentInventoryCard(item, data.planningDays, t, i18n.resolvedLanguage),
  );

  const forecastRows = data.items.map((item) =>
    presentInventoryForecast(item, t, i18n.resolvedLanguage),
  );

  return (
    <div className={styles.view}>
      <Panel
        title={t("inventory.title")}
        subtitle={t("inventory.materialsSubtitle", {
          days: data.planningDays,
        })}
      >
        <MaterialGrid materials={materialCards} />
      </Panel>

      <Panel
        title={t("inventory.forecastTitle")}
        subtitle={t("inventory.forecastSubtitle", {
          days: data.planningDays,
        })}
      >
        <InventoryForecastTable rows={forecastRows} />
      </Panel>
    </div>
  );
}
