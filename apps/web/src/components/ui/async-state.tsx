import { Inbox, LoaderCircle, RotateCcw, TriangleAlert } from "lucide-react";
import styles from "./async-state.module.css";

type AsyncStateVariant = "loading" | "error" | "empty";

interface AsyncStateProps {
  variant: AsyncStateVariant;
  title: string;
  message?: string;
  onRetry?: () => void;
}

export function AsyncState({
  variant,
  title,
  message,
  onRetry,
}: AsyncStateProps) {
  return (
    <div
      className={`${styles.state} ${styles[variant]}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {variant === "loading" ? (
        <LoaderCircle size={24} aria-hidden="true" />
      ) : null}

      {variant === "error" ? (
        <TriangleAlert size={24} aria-hidden="true" />
      ) : null}

      {variant === "empty" ? <Inbox size={24} aria-hidden="true" /> : null}

      <div>
        <h3>{title}</h3>
        {message ? <p>{message}</p> : null}
      </div>

      {variant === "error" && onRetry ? (
        <button type="button" onClick={onRetry}>
          <RotateCcw size={14} />
          다시 시도
        </button>
      ) : null}
    </div>
  );
}
