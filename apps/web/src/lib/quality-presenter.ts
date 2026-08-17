import {
  MEASUREMENT_UNIT_LABELS,
  PROCESS_TRACE_STATUS_LABELS,
  TEST_TYPE_LABELS,
  TRACE_STATUS_LABELS,
} from "../constants/quality";
import { PROCESS_LABELS } from "../constants/processes";
import { formatMonthDay, formatTime } from "./helpers";
import {
  QualityTestRecord,
  QualityTestViewModel,
  QualityTraceResponse,
} from "@/types/quality";

const valueFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 3,
});

function formatUnit(unit: string | null) {
  if (!unit) {
    return "";
  }

  return MEASUREMENT_UNIT_LABELS[unit] ?? unit;
}

function formatMeasuredValue(test: QualityTestRecord) {
  if (test.measuredValue === null) {
    return "—";
  }

  const unit = formatUnit(test.measurementUnit);

  return `${valueFormatter.format(test.measuredValue)}${unit ? ` ${unit}` : ""}`;
}

function formatStandard(test: QualityTestRecord) {
  const unit = formatUnit(test.measurementUnit);

  if (test.lowerLimit !== null && test.upperLimit !== null) {
    return `${test.lowerLimit}–${test.upperLimit}${unit ? ` ${unit}` : ""}`;
  }

  if (test.lowerLimit !== null) {
    return `≥ ${test.lowerLimit}${unit ? ` ${unit}` : ""}`;
  }

  if (test.upperLimit !== null) {
    return `≤ ${test.upperLimit}${unit ? ` ${unit}` : ""}`;
  }

  return "전 항목";
}

export function presentQualityTests(
  trace: QualityTraceResponse,
): QualityTestViewModel[] {
  return trace.units.flatMap((unit) =>
    unit.processes.flatMap((process) =>
      process.tests.map((test) => ({
        id: test.id,
        unit: unit.serialNo,
        testName: TEST_TYPE_LABELS[test.testType] ?? test.testType,
        measuredValue: formatMeasuredValue(test),
        standard: formatStandard(test),
        result: test.result,
        operatorAndTime: `${test.operatorName ?? "시험자 미지정"} · ${formatTime(test.testedAt)}`,
      })),
    ),
  );
}

function presentQualityCount(
  label: string,
  summary: QualityTraceResponse["qualitySummary"]["tests"],
) {
  if (summary.total === 0) {
    return `${label} 대기`;
  }

  if (summary.failed > 0) {
    return `${label} FAIL ${summary.failed}건`;
  }

  if (summary.review > 0) {
    return `${label} REVIEW ${summary.review}건`;
  }

  return `${label} PASS ${summary.passed}/${summary.total}`;
}

export function presentQualityTraceSteps(
  trace: QualityTraceResponse,
): string[] {
  const processes = trace.units.flatMap((unit) => unit.processes);

  const materialUsages = processes.flatMap((process) => process.materialUsage);

  const tests = processes.flatMap((process) => process.tests);

  const activeProcess = processes
    .filter((process) => process.status !== "PENDING")
    .sort((first, second) => second.step.sequence - first.step.sequence)[0];

  const firstMaterialUsage = materialUsages[0];

  const uniqueLotCount = new Set(materialUsages.map((usage) => usage.lotNo))
    .size;

  const lotStep = firstMaterialUsage
    ? `자재 LOT ${firstMaterialUsage.lotNo}${
        uniqueLotCount > 1 ? ` 외 ${uniqueLotCount - 1}건` : ""
      }`
    : "자재 LOT 미등록";

  const processStep = activeProcess
    ? `${
        PROCESS_LABELS[activeProcess.step.code] ?? activeProcess.step.name
      } ${PROCESS_TRACE_STATUS_LABELS[activeProcess.status]}`
    : "생산 공정 대기";

  const certificateCount = tests.filter((test) => test.certificateNo).length;

  return [
    trace.order.orderNo,
    `수주 ${formatMonthDay(trace.order.orderDate)} · ${trace.order.customer.name}`,
    `${trace.order.productName} · ${trace.order.quantity}면`,
    lotStep,
    processStep,
    presentQualityCount("AI검사", trace.qualitySummary.inspections),
    presentQualityCount("시험", trace.qualitySummary.tests),
    certificateCount > 0
      ? `성적서 ${certificateCount}건 추적`
      : `품질 종합 ${TRACE_STATUS_LABELS[trace.qualitySummary.traceStatus]}`,
  ];
}
