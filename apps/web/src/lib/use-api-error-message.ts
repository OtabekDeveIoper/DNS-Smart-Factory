"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "./api";

export function useApiErrorMessage() {
  const { t } = useTranslation();

  return useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof ApiError) {
        if (error.kind === "connection") {
          return t("common.errors.connection");
        }

        if (error.kind === "invalid-response") {
          return t("common.errors.invalidResponse");
        }

        if (error.kind === "request") {
          return t("common.errors.requestFailed", { status: error.status });
        }
      }

      return error instanceof Error ? error.message : fallback;
    },
    [t],
  );
}
