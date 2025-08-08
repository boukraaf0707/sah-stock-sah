export interface Product {
  id: string;
  nameAr: string;
  nameEn?: string;
  category: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  price: number; // Keep for backward compatibility - will reference sellingPrice
  supplier?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  minStock?: number;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn?: string;
  color?: string;
}

export const CATEGORIES: Category[] = [
  { id: '1', nameAr: 'كانكيري', nameEn: 'Plumbing', color: 'blue' },
  { id: '2', nameAr: 'أرتيكل فروا شو', nameEn: 'Cold/Hot Articles', color: 'cyan' },
  { id: '3', nameAr: 'تريسيتي', nameEn: 'Electricity', color: 'yellow' },
  { id: '4', nameAr: 'بلومبري', nameEn: 'Plumbing Parts', color: 'green' },
];