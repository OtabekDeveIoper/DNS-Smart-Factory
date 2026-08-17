import { TRACE_STEPS } from "../../data/quality.mock";
import styles from "./quality-view.module.css";

export function TraceFlow() {
  return (
    <div className={styles.traceFlow}>
      {TRACE_STEPS.map((step, index) => (
        <div className={styles.traceGroup} key={step}>
          <span
            className={index === 0 ? styles.highlightedStep : styles.traceStep}
          >
            {step}
          </span>
          {index < TRACE_STEPS.length - 1 ? <em>→</em> : null}
        </div>
      ))}
    </div>
  );
}
