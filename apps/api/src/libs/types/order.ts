export type DeliveryRiskLevel =
  'COMPLETED' | 'OVERDUE' | 'HIGH' | 'MEDIUM' | 'ON_TRACK';

export interface DeliveryRisk {
  level: DeliveryRiskLevel;
  remainingStandardHours: number;
  productionDays: number;
  bufferDays: number;
  requiredDays: number;
  availableDays: number;
  marginDays: number;
  projectedCompletionAt: string | null;
}
