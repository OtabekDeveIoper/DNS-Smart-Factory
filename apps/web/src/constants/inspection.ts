import type { InspectionResult } from "../types/inspection";

export const INSPECTION_RESULT_TONES = {
  PASS: "success",
  FAIL: "danger",
  REVIEW: "warning",
} as const satisfies Record<InspectionResult, "success" | "danger" | "warning">;
