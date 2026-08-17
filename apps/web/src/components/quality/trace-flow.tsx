import styles from "./quality-view.module.css";

interface TraceFlowProps {
  steps: string[];
}

export function TraceFlow({ steps }: TraceFlowProps) {
  if (steps.length === 0) {
    return <div className={styles.state}>표시할 추적 이력이 없습니다.</div>;
  }

  return (
    <div className={styles.traceFlow}>
      {steps.map((step, index) => (
        <div className={styles.traceGroup} key={`${step}-${index}`}>
          <span
            className={index === 0 ? styles.highlightedStep : styles.traceStep}
          >
            {step}
          </span>

          {index < steps.length - 1 ? <em>→</em> : null}
        </div>
      ))}
    </div>
  );
}
