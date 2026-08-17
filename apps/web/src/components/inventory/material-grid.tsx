import { useTranslation } from "react-i18next";
import type {
  InventoryCardViewModel,
  InventoryStockStatus,
} from "../../types/inventory";
import styles from "./inventory-view.module.css";

interface MaterialGridProps {
  materials: InventoryCardViewModel[];
}

const barStyles: Record<InventoryStockStatus, string> = {
  SUFFICIENT: styles.successBar,
  LOW: styles.warningBar,
  SHORTAGE: styles.dangerBar,
};

const captionStyles: Partial<Record<InventoryStockStatus, string>> = {
  LOW: styles.warningText,
  SHORTAGE: styles.dangerText,
};

export function MaterialGrid({ materials }: MaterialGridProps) {
  const { t } = useTranslation();

  if (materials.length === 0) {
    return <div className={styles.state}>{t("inventory.emptyMaterials")}</div>;
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
