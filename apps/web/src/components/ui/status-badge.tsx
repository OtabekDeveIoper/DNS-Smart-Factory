import type { ReactNode } from "react";
import styles from "./status-badge.module.css";

export type StatusTone = "success" | "warning" | "danger" | "info" | "muted";

interface StatusBadgeProps {
  tone: StatusTone;
  children: ReactNode;
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
