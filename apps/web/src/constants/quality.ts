import type { QualityResult } from "../types/quality";

export const MEASUREMENT_UNIT_LABELS: Record<string, string> = {
  MOhm: "MΩ",
  kV: "kV",
  mA: "mA",
};

export const QUALITY_RESULT_TONES = {
  PASS: "success",
  FAIL: "danger",
  REVIEW: "warning",
} as const satisfies Record<QualityResult, "success" | "danger" | "warning">;
