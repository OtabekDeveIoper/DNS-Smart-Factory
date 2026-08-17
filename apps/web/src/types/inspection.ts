import type { ProcessStatus, UnitStatus } from "./orders";

export type InspectionResult = "PASS" | "FAIL" | "REVIEW";

export interface InspectionTarget {
  id: string;
  serialNo: string;
  unitNumber: number;
  unitStatus: UnitStatus;
  order: {
    orderNo: string;
    productName: string;
    modelName: string | null;
  };
  wiringProcess: {
    id: string;
    status: ProcessStatus;
    equipmentCode: string | null;
    operatorName: string | null;
    startedAt: string | null;
    completedAt: string | null;
  } | null;
  latestInspection: {
    id: string;
    result: InspectionResult;
    confidence: number | null;
    defectType: string | null;
    inspectedAt: string;
  } | null;
}

export interface AnalyzeInspectionInput {
  serialNo: string;
  imageUrl?: string;
  cameraCode?: string;
  simulateDefect?: boolean;
}

export interface AnalyzeInspectionResponse {
  unit: {
    serialNo: string;
    status: UnitStatus;
    order: {
      orderNo: string;
      productName: string;
    };
  };
  inspection: {
    id: string;
    unitId: string;
    processRecordId: string | null;
    inspectionType: string;
    result: InspectionResult;
    cameraCode: string | null;
    defectType: string | null;
    defectLocation: string | null;
    confidence: number | null;
    imageUrl: string | null;
    inspectorName: string | null;
    inspectedAt: string;
    notes: string | null;
  };
  event: {
    id: string;
    type: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    occurredAt: string;
  };
}

export type InspectionPhase = "idle" | "scanning" | "complete" | "error";

export interface InspectionHistoryItem {
  id: string;
  inspectionType: string;
  result: InspectionResult;
  cameraCode: string | null;
  defectType: string | null;
  defectLocation: string | null;
  confidence: number | null;
  imageUrl: string | null;
  inspectorName: string | null;
  inspectedAt: string;
  notes: string | null;
  processRecord: {
    id: string;
    status: ProcessStatus;
    processStep: {
      code: string;
      name: string;
      sequence: number;
    };
  } | null;
}

export interface UnitInspectionHistory {
  id: string;
  serialNo: string;
  unitNumber: number;
  status: UnitStatus;
  order: {
    orderNo: string;
    productName: string;
    modelName: string | null;
  };
  inspections: InspectionHistoryItem[];
}
