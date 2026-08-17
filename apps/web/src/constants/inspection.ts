import type { InspectionResult } from "../types/inspection";

export const INSPECTION_RESULT_LABELS: Record<
  InspectionResult,
  string
> = {
  PASS: "PASS",
  FAIL: "오결선 의심",
  REVIEW: "검토 필요",
};

export const INSPECTION_RESULT_TONES = {
  PASS: "success",
  FAIL: "danger",
  REVIEW: "warning",
} as const satisfies Record<
  InspectionResult,
  "success" | "danger" | "warning"
>;  