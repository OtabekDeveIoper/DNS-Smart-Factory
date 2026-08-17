export type OrderUiStatus = "정상" | "지연주의" | "자재 발주중" | "완료";

export interface OrderRow {
  orderNo: string;
  product: string;
  customer: string;
  dueDate: string;
  progress: number;
  currentProcess: string;
  status: OrderUiStatus;
}
