"use client";

import {
  presentInventoryCard,
  presentInventoryForecast,
} from "../../lib/inventory-presenter";
import { useInventory } from "../../lib/use-inventory";
import { Panel } from "../ui/panel";
import { InventoryForecastTable } from "./inventory-forecast-table";
import { MaterialGrid } from "./material-grid";
import styles from "./inventory-view.module.css";
import { getErrorMessage } from "../../lib/api";
import { AsyncState } from "../ui/async-state";

export function InventoryView() {
  const { data, error, isLoading, mutate } = useInventory();

  if (isLoading && !data) {
    return (
      <Panel title="주요 자재 현황" subtitle="재고 데이터 동기화">
        <AsyncState variant="loading" title="자재 정보를 불러오고 있습니다" />
      </Panel>
    );
  }

  if (error || !data) {
    return (
      <Panel title="주요 자재 현황" subtitle="API 연결 오류">
        <AsyncState
          variant="error"
          title="자재 정보를 불러오지 못했습니다"
          message={getErrorMessage(error, "잠시 후 다시 시도해 주세요.")}
          onRetry={() => void mutate()}
        />
      </Panel>
    );
  }

  const materialCards = data.items.map((item) =>
    presentInventoryCard(item, data.planningDays),
  );

  const forecastRows = data.items.map(presentInventoryForecast);

  return (
    <div className={styles.view}>
      <Panel
        title="주요 자재 현황"
        subtitle={`수주 BOM 연동 · ${data.planningDays}일 소요 기준`}
      >
        <MaterialGrid materials={materialCards} />
      </Panel>

      <Panel
        title="AI 소요 예측"
        subtitle={`현재고 + 확정 수주 · ${data.planningDays}일 계획`}
      >
        <InventoryForecastTable rows={forecastRows} />
      </Panel>
    </div>
  );
}
