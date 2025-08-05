export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  notes?: string;
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleForm {
  items: SaleItem[];
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  notes?: string;
}

export const PAYMENT_METHOD_LABELS = {
  cash: 'نقداً',
  card: 'بطاقة',
  transfer: 'تحويل'
};