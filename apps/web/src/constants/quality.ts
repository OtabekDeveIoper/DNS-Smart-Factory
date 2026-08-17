import type { QualityResult, TraceStatus } from "../types/quality";
import type { ProcessStatus } from "../types/orders";

export const TEST_TYPE_LABELS: Record<string, string> = {
  INSULATION_RESISTANCE: "절연저항",
  AC_WITHSTAND: "내전압",
  SEQUENCE_OPERATION: "시퀀스 동작시험",
};

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

export const QUALITY_RESULT_LABELS: Record<QualityResult, string> = {
  PASS: "PASS",
  FAIL: "FAIL · 재시험",
  REVIEW: "REVIEW",
};

export const TRACE_STATUS_LABELS: Record<TraceStatus, string> = {
  PASS: "PASS",
  FAIL: "FAIL",
  REVIEW: "검토 필요",
  PENDING: "대기",
};

export const PROCESS_TRACE_STATUS_LABELS: Record<ProcessStatus, string> = {
  PENDING: "대기",
  IN_PROGRESS: "진행",
  COMPLETED: "완료",
  REWORK: "재작업",
  BLOCKED: "중단",
};
