import {
  INVENTORY_STATUS_LABELS,
  MATERIAL_LABELS,
  MATERIAL_UNIT_LABELS,
} from "../constants/inventory";
import type {
  InventoryCardViewModel,
  InventoryForecastRow,
  InventoryItem,
} from "../types/inventory";
import { formatMonthDay } from "./helpers";

const quantityFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 1,
});

function formatQuantity(value: number) {
  return quantityFormatter.format(value);
}

function getPurchaseSuggestion(item: InventoryItem) {
  if (item.status === "SUFFICIENT") {
    return "—";
  }

  if (item.status === "LOW") {
    return "재고 추이 모니터링";
  }

  if (!item.purchaseByAt) {
    return `발주 필요 (리드타임 ${item.leadTimeDays}일)`;
  }

  const purchaseDate = new Date(item.purchaseByAt);
  const isPurchaseOverdue = purchaseDate.getTime() <= Date.now();

  return isPurchaseOverdue
    ? `즉시 발주 (리드타임 ${item.leadTimeDays}일)`
    : `${formatMonthDay(item.purchaseByAt)}까지 발주`;
}

export function presentInventoryCard(
  item: InventoryItem,
  planningDays: number,
): InventoryCardViewModel {
  const unit = MATERIAL_UNIT_LABELS[item.unit];

  const level =
    item.requiredStock <= 0
      ? 100
      : Math.min(
          100,
          Math.round((item.currentStock / item.requiredStock) * 100),
        );

  const caption =
    item.status === "SHORTAGE"
      ? `부족 ${formatQuantity(item.shortageQuantity)}${unit} · 리드타임 ${item.leadTimeDays}일`
      : item.status === "LOW"
        ? `안전재고 근접 · 예상 잔량 ${formatQuantity(item.projectedBalance)}${unit}`
        : `향후 ${planningDays}일 소요 대비 충분`;

  return {
    id: item.id,
    name: MATERIAL_LABELS[item.code] ?? item.name,
    quantity: formatQuantity(item.currentStock),
    unit,
    level,
    status: INVENTORY_STATUS_LABELS[item.status],
    caption,
  };
}

export function presentInventoryForecast(
  item: InventoryItem,
): InventoryForecastRow {
  const unit = MATERIAL_UNIT_LABELS[item.unit];
  const status = INVENTORY_STATUS_LABELS[item.status];

  return {
    id: item.id,
    material: MATERIAL_LABELS[item.code] ?? item.name,
    currentStock: `${formatQuantity(item.currentStock)}${unit}`,
    demand: `${formatQuantity(item.twoWeekDemand)}${unit}`,
    status,
    shortage:
      item.shortageQuantity > 0
        ? `부족 ${formatQuantity(item.shortageQuantity)}${unit}`
        : null,
    suggestion: getPurchaseSuggestion(item),
  };
}
