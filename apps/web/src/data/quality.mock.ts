import type { QualityTestRow } from "../types/quality";

export const QUALITY_TEST_ROWS: QualityTestRow[] = [
  {
    unit: "DN-2607-011",
    testName: "절연저항 (1000V)",
    measuredValue: "2,340 MΩ",
    standard: "≥ 1,000",
    result: "PASS",
    operatorAndTime: "QC-02 · 07-16 09:41",
  },
  {
    unit: "DN-2607-011",
    testName: "내전압 (AC 22kV/1min)",
    measuredValue: "누설 4.2 mA",
    standard: "이상 없음",
    result: "PASS",
    operatorAndTime: "QC-02 · 07-16 10:05",
  },
  {
    unit: "DN-2606-088",
    testName: "시퀀스 동작시험",
    measuredValue: "32/32 step",
    standard: "전 항목",
    result: "PASS",
    operatorAndTime: "QC-01 · 07-15 16:20",
  },
  {
    unit: "DN-2607-009",
    testName: "절연저항 (500V)",
    measuredValue: "88 MΩ",
    standard: "≥ 100",
    result: "FAIL",
    operatorAndTime: "QC-01 · 07-14 11:02",
  },
];

export const TRACE_STEPS = [
  "DN-2607-011",
  "수주 06-02 · ○○산단",
  "설계 Rev.C 승인",
  "MCCB LOT #A2417",
  "배선 작업 06-28~07-02",
  "AI검사 PASS (0건)",
  "내전압 PASS 07-16",
  "성적서 PDF 자동발행",
];
