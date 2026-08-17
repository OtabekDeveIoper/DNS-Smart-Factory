import type { MaterialUnit } from "./inventory";
import type { OrderStatus, ProcessStatus, UnitStatus } from "./orders";

export type QualityResult = "PASS" | "FAIL" | "REVIEW";

export type TraceStatus = QualityResult | "PENDING";

export interface QualityCountSummary {
  total: number;
  passed: number;
  failed: number;
  review: number;
}

export interface QualityTestRecord {
  id: string;
  processRecordId: string | null;
  testType: string;
  result: QualityResult;
  measuredValue: number | null;
  measurementUnit: string | null;
  lowerLimit: number | null;
  upperLimit: number | null;
  equipmentName: string | null;
  operatorName: string | null;
  certificateNo: string | null;
  testedAt: string;
  notes: string | null;
}

export interface QualityInspectionRecord {
  id: string;
  processRecordId: string | null;
  inspectionType: string;
  result: QualityResult;
  cameraCode: string | null;
  defectType: string | null;
  defectLocation: string | null;
  confidence: number | null;
  imageUrl: string | null;
  inspectorName: string | null;
  inspectedAt: string;
  notes: string | null;
}

export interface QualityMaterialUsage {
  id: string;
  material: {
    code: string;
    name: string;
    unit: MaterialUnit;
  };
  lotNo: string;
  supplierName: string | null;
  quantity: number;
  consumedAt: string;
  operatorName: string | null;
}

export interface QualityProcessTrace {
  id: string;
  step: {
    code: string;
    name: string;
    sequence: number;
    standardHours: number;
  };
  status: ProcessStatus;
  equipmentCode: string | null;
  operatorName: string | null;
  startedAt: string | null;
  completedAt: string | null;
  materialUsage: QualityMaterialUsage[];
  inspections: QualityInspectionRecord[];
  tests: QualityTestRecord[];
}

export interface QualityUnitTrace {
  id: string;
  serialNo: string;
  unitNumber: number;
  status: UnitStatus;
  startedAt: string | null;
  completedAt: string | null;
  processes: QualityProcessTrace[];
}

export interface QualityTraceResponse {
  order: {
    id: string;
    orderNo: string;
    customer: {
      code: string;
      name: string;
    };
    productName: string;
    modelName: string | null;
    quantity: number;
    status: OrderStatus;
    orderDate: string;
    plannedStartAt: string | null;
    dueDate: string;
    completedAt: string | null;
  };
  qualitySummary: {
    traceStatus: TraceStatus;
    inspections: QualityCountSummary;
    tests: QualityCountSummary;
  };
  bom: Array<{
    id: string;
    material: {
      code: string;
      name: string;
      unit: MaterialUnit;
    };
    quantityPerUnit: number;
    scrapRate: number;
  }>;
  units: QualityUnitTrace[];
  generatedAt: string;
}

export interface QualityTestViewModel {
  id: string;
  unit: string;
  testName: string;
  measuredValue: string;
  standard: string;
  result: QualityResult;
  operatorAndTime: string;
}
