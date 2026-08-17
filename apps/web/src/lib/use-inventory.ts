"use client";

import useSWR from "swr";
import type { InventoryOverview } from "../types/inventory";
import { apiFetch } from "./api";

export function useInventory() {
  return useSWR<InventoryOverview>("/inventory/overview", apiFetch, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
}
