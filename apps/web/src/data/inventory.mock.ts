import type { MaterialCardData, MaterialForecast } from "../types/inventory";

export const MATERIAL_CARDS: MaterialCardData[] = [
  {
    name: "MCCB (주요 프레임)",
    quantity: "146",
    unit: "EA",
    level: 72,
    status: "충분",
    caption: "향후 4주 소요 대비 충분",
  },
  {
    name: "전자접촉기 (MC)",
    quantity: "88",
    unit: "EA",
    level: 38,
    status: "주의",
    caption: "DN-021 착수 전 30EA 발주 권고",
  },
  {
    name: "동 부스바 (25×3T)",
    quantity: "412",
    unit: "m",
    level: 64,
    status: "충분",
    caption: "시세 연동 발주 시점 분석 지원",
  },
  {
    name: "외함 강판 (1.6T)",
    quantity: "57",
    unit: "매",
    level: 14,
    status: "결품",
    caption: "결품 경보 — 리드타임 5일, 금일 발주 필요",
  },
  {
    name: "단자대·덕트류",
    quantity: "양호",
    unit: "",
    level: 81,
    status: "충분",
    caption: "소모성 자동 보충 규칙 적용",
  },
];

export const MATERIAL_FORECASTS: MaterialForecast[] = [
  {
    material: "외함 강판 1.6T",
    currentStock: "57매",
    demand: "96매",
    status: "결품",
    shortage: "부족 39",
    suggestion: "금일 발주 (리드타임 5일)",
  },
  {
    material: "전자접촉기 MC-22b",
    currentStock: "88EA",
    demand: "104EA",
    status: "주의",
    shortage: "부족 16",
    suggestion: "7/18까지 발주",
  },
  {
    material: "MCCB 100AF",
    currentStock: "146EA",
    demand: "92EA",
    status: "충분",
    suggestion: "—",
  },
];
