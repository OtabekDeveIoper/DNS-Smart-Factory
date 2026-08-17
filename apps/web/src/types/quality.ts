export type QualityResult = "PASS" | "FAIL";

export interface QualityTestRow {
  unit: string;
  testName: string;
  measuredValue: string;
  standard: string;
  result: QualityResult;
  operatorAndTime: string;
}
