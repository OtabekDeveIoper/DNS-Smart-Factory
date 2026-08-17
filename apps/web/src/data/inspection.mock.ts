import type { InspectionResultItem } from "../types/inspection";

export const INSPECTION_RESULTS: InspectionResultItem[] = [
  {
    label: "단자 4열 · 배선 경로 상이 (도면 Rev.C 대비)",
    result: "오결선 의심",
    confidence: 97.2,
    failed: true,
  },
  {
    label: "단자 1~3열 · 체결·경로 정상",
    result: "PASS",
    confidence: 99.1,
    failed: false,
  },
  {
    label: "압착단자 누락 검사",
    result: "PASS",
    confidence: 98.4,
    failed: false,
  },
];
