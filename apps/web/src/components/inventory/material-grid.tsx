import type {
  InventoryCardViewModel,
  InventoryStatus,
} from "../../types/inventory";
import styles from "./inventory-view.module.css";

interface MaterialGridProps {
  materials: InventoryCardViewModel[];
}

const barStyles: Record<InventoryStatus, string> = {
  충분: styles.successBar,
  주의: styles.warningBar,
  결품: styles.dangerBar,
};

const captionStyles: Partial<Record<InventoryStatus, string>> = {
  주의: styles.warningText,
  결품: styles.dangerText,
};

export function MaterialGrid({ materials }: MaterialGridProps) {
  if (materials.length === 0) {
    return <div className={styles.state}>등록된 자재가 없습니다.</div>;
  }

  return (
    <div className={styles.materialGrid}>
      {materials.map((material) => (
        <article className={styles.materialCard} key={material.id}>
          <span>{material.name}</span>

          <strong>
            {material.quantity}
            <small>{material.unit}</small>
          </strong>

          <div className={styles.progressTrack}>
            <span
              className={barStyles[material.status]}
              style={{ width: `${material.level}%` }}
            />
          </div>

          <p className={captionStyles[material.status]}>{material.caption}</p>
        </article>
      ))}
    </div>
  );
}
