export type Person = 'abdullah' | 'bokrae';

export interface Abdullah {
  id: string;
  person: Person;
  items: AbdullahItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
  isPaid: boolean;
  notes?: string;
  balanceType?: 'abdullah_owes' | 'bokrae_owes' | 'balanced'; // Who owes whom
}

export interface AbdullahItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AbdullahForm {
  person: Person;
  items: AbdullahItem[];
  notes?: string;
}

export interface AbdullahPaymentForm {
  amount: number;
  notes?: string;
}