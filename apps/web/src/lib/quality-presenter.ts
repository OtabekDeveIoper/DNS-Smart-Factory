import type { TFunction } from "i18next";
import { MEASUREMENT_UNIT_LABELS } from "../constants/quality";
import { KNOWN_PROCESS_CODES } from "../constants/processes";
import { formatMonthDay, formatNumber, formatTime } from "./helpers";
import type {
  QualityTestRecord,
  QualityTestViewModel,
  QualityTraceResponse,
} from "@/types/quality";

function formatUnit(unit: string | null) {
  if (!unit) return "";
  return MEASUREMENT_UNIT_LABELS[unit] ?? unit;
}

function formatMeasuredValue(test: QualityTestRecord, language?: string) {
  if (test.measuredValue === null) return "—";
  const unit = formatUnit(test.measurementUnit);
  const value = formatNumber(test.measuredValue, language, 3);
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function formatStandard(test: QualityTestRecord, t: TFunction) {
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
  return t("quality.allItems");
}

export function presentQualityTests(
  trace: QualityTraceResponse,
  t: TFunction,
  language?: string,
): QualityTestViewModel[] {
  return trace.units.flatMap((unit) =>
    unit.processes.flatMap((process) =>
      process.tests.map((test) => ({
        id: test.id,
        unit: unit.serialNo,
        testName: t(`quality.tests.${test.testType}`, {
          defaultValue: test.testType,
        }),
        measuredValue: formatMeasuredValue(test, language),
        standard: formatStandard(test, t),
        result: test.result,
        operatorAndTime: `${test.operatorName ?? t("quality.operatorUnknown")} · ${formatTime(test.testedAt, language)}`,
      })),
    ),
  );
}

function presentQualityCount(
  label: string,
  summary: QualityTraceResponse["qualitySummary"]["tests"],
  t: TFunction,
) {
  if (summary.total === 0) return t("quality.count.pending", { label });
  if (summary.failed > 0) {
    return t("quality.count.failed", { label, count: summary.failed });
  }
  if (summary.review > 0) {
    return t("quality.count.review", { label, count: summary.review });
  }
  return t("quality.count.passed", {
    label,
    passed: summary.passed,
    total: summary.total,
  });
}

export function presentQualityTraceSteps(
  trace: QualityTraceResponse,
  t: TFunction,
  language?: string,
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
    ? `${t("quality.trace.materialLot", { lot: firstMaterialUsage.lotNo })}${
        uniqueLotCount > 1
          ? t("quality.trace.additionalLots", { count: uniqueLotCount - 1 })
          : ""
      }`
    : t("quality.trace.materialLotMissing");
  const processStep = activeProcess
    ? `${
        KNOWN_PROCESS_CODES.has(activeProcess.step.code)
          ? t(`processes.${activeProcess.step.code}`)
          : activeProcess.step.name
      } ${t(`quality.processStatus.${activeProcess.status}`)}`
    : t("quality.trace.productionPending");
  const certificateCount = tests.filter((test) => test.certificateNo).length;

  return [
    trace.order.orderNo,
    t("quality.trace.order", {
      date: formatMonthDay(trace.order.orderDate, language),
      customer: trace.order.customer.name,
    }),
    t("quality.trace.product", {
      product: t(`orders.products.${trace.order.productName}`, {
        defaultValue: trace.order.productName,
      }),
      count: trace.order.quantity,
    }),
    lotStep,
    processStep,
    presentQualityCount(
      t("quality.trace.aiInspection"),
      trace.qualitySummary.inspections,
      t,
    ),
    presentQualityCount(t("quality.trace.test"), trace.qualitySummary.tests, t),
    certificateCount > 0
      ? t("quality.trace.certificate", { count: certificateCount })
      : t("quality.trace.qualitySummary", {
          status: t(`quality.traceStatus.${trace.qualitySummary.traceStatus}`),
        }),
  ];
}
