"use client";

import useSWR from "swr";
import type { QualityTraceResponse } from "../types/quality";
import { apiFetch } from "./api";

export function useQualityTrace(orderNo: string | null) {
  const path = orderNo ? `/quality/trace/${encodeURIComponent(orderNo)}` : null;

  return useSWR<QualityTraceResponse>(path, apiFetch, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
    keepPreviousData: false,
  });
}
