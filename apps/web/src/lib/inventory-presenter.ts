import type { TFunction } from "i18next";
import { MATERIAL_UNIT_LABELS } from "../constants/inventory";
import type {
  InventoryCardViewModel,
  InventoryForecastRow,
  InventoryItem,
} from "../types/inventory";
import { formatMonthDay, formatNumber } from "./helpers";

function getPurchaseSuggestion(
  item: InventoryItem,
  t: TFunction,
  language?: string,
) {
  if (item.status === "SUFFICIENT") {
    return "—";
  }

  if (item.status === "LOW") {
    return t("inventory.suggestion.monitor");
  }

  if (!item.purchaseByAt) {
    return t("inventory.suggestion.orderRequired", {
      days: item.leadTimeDays,
    });
  }

  const purchaseDate = new Date(item.purchaseByAt);
  const isPurchaseOverdue = purchaseDate.getTime() <= Date.now();

  return isPurchaseOverdue
    ? t("inventory.suggestion.orderNow", { days: item.leadTimeDays })
    : t("inventory.suggestion.orderBy", {
        date: formatMonthDay(item.purchaseByAt, language),
      });
}

function getMaterialName(item: InventoryItem, t: TFunction) {
  return t(`inventory.materials.${item.code}`, { defaultValue: item.name });
}

export function presentInventoryCard(
  item: InventoryItem,
  planningDays: number,
  t: TFunction,
  language?: string,
): InventoryCardViewModel {
  const unit = MATERIAL_UNIT_LABELS[item.unit];
  const formatQuantity = (value: number) => formatNumber(value, language);
  const level =
    item.requiredStock <= 0
      ? 100
      : Math.min(
          100,
          Math.round((item.currentStock / item.requiredStock) * 100),
        );
  const caption =
    item.status === "SHORTAGE"
      ? t("inventory.caption.shortage", {
          quantity: formatQuantity(item.shortageQuantity),
          unit,
          days: item.leadTimeDays,
        })
      : item.status === "LOW"
        ? t("inventory.caption.low", {
            quantity: formatQuantity(item.projectedBalance),
            unit,
          })
        : t("inventory.caption.sufficient", { days: planningDays });

  return {
    id: item.id,
    name: getMaterialName(item, t),
    quantity: formatQuantity(item.currentStock),
    unit,
    level,
    status: item.status,
    caption,
  };
}

export function presentInventoryForecast(
  item: InventoryItem,
  t: TFunction,
  language?: string,
): InventoryForecastRow {
  const unit = MATERIAL_UNIT_LABELS[item.unit];
  const formatQuantity = (value: number) => formatNumber(value, language);

  return {
    id: item.id,
    material: getMaterialName(item, t),
    currentStock: `${formatQuantity(item.currentStock)}${unit}`,
    demand: `${formatQuantity(item.twoWeekDemand)}${unit}`,
    status: item.status,
    shortage:
      item.shortageQuantity > 0
        ? t("inventory.shortage", {
            quantity: formatQuantity(item.shortageQuantity),
            unit,
          })
        : null,
    suggestion: getPurchaseSuggestion(item, t, language),
  };
}
