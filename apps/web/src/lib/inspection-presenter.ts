import type { TFunction } from "i18next";

const inspectionDataKeys: Record<string, string> = {
  POSSIBLE_MISWIRING: "possibleMiswiring",
  "Manual review required": "manualReview",
  "No wiring defect detected": "noDefect",
  "Terminal block TB-12": "terminalBlock",
  AI_WIRING: "aiWiring",
};

export function presentInspectionData(
  value: string | null,
  t: TFunction,
): string | null {
  if (!value) return null;

  const key = inspectionDataKeys[value];

  return key ? t(`inspection.data.${key}`) : value;
}
