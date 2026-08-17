"use client";

import useSWR from "swr";
import { apiFetch } from "./api";
import type { DashboardOverview } from "../types/dashboard";

export function useDashboard() {
  return useSWR<DashboardOverview>("/dashboard/overview", apiFetch, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
}
