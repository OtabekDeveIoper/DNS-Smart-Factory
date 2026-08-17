"use client";

import useSWR from "swr";
import { apiFetch } from "./api";
import type { OrderListItem } from "../types/orders";

export function useOrders() {
  return useSWR<OrderListItem[]>("/orders", apiFetch, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
}
