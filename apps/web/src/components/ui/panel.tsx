import type { ReactNode } from "react";
import styles from "./panel.module.css";

interface PanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, subtitle, children, className }: PanelProps) {
  return (
    <section className={`${styles.panel} ${className ?? ""}`}>
      <header className={styles.header}>
        <h2>{title}</h2>
        {subtitle ? <span>{subtitle}</span> : null}
      </header>
      {children}
    </section>
  );
}
