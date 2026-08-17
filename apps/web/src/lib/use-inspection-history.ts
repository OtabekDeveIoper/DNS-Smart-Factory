"use client";

import useSWR from "swr";
import type { UnitInspectionHistory } from "../types/inspection";
import { apiFetch } from "./api";

export function useInspectionHistory(serialNo: string | null) {
  const path = serialNo
    ? `/inspections/unit/${encodeURIComponent(serialNo)}`
    : null;

  return useSWR<UnitInspectionHistory>(path, apiFetch, {
    revalidateOnFocus: true,
    keepPreviousData: false,
  });
}
