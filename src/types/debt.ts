export interface Debt {
  id: string;
  clientName: string;
  clientPhone?: string;
  items: DebtItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
  isPaid: boolean;
  notes?: string;
}

export interface DebtItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DebtForm {
  clientName: string;
  clientPhone?: string;
  items: DebtItem[];
  notes?: string;
}

export interface PaymentForm {
  amount: number;
  notes?: string;
}