import type {
  AnalyzeInspectionInput,
  AnalyzeInspectionResponse,
} from "../types/inspection";
import { apiFetch } from "./api";

export function analyzeInspection(
  input: AnalyzeInspectionInput,
): Promise<AnalyzeInspectionResponse> {
  return apiFetch<AnalyzeInspectionResponse>("/inspections/analyze", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
