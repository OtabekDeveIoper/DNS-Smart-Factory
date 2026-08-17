import type { ReactNode } from "react";
import styles from "./data-table.module.css";

interface DataTableProps {
  children: ReactNode;
}

export function DataTable({ children }: DataTableProps) {
  return (
    <div className={styles.viewport}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}
