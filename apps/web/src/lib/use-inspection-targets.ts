"use client";

import useSWR from "swr";
import type { InspectionTarget } from "../types/inspection";
import { apiFetch } from "./api";

export function useInspectionTargets() {
  return useSWR<InspectionTarget[]>("/inspections/targets", apiFetch, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
}
