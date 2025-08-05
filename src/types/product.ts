export interface Product {
  id: string;
  nameAr: string;
  nameEn?: string;
  category: string;
  quantity: number;
  price: number;
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
  { id: '1', nameAr: 'إلكترونيات', nameEn: 'Electronics', color: 'blue' },
  { id: '2', nameAr: 'ملابس', nameEn: 'Clothing', color: 'purple' },
  { id: '3', nameAr: 'طعام ومشروبات', nameEn: 'Food & Beverages', color: 'green' },
  { id: '4', nameAr: 'أدوات منزلية', nameEn: 'Home & Garden', color: 'orange' },
  { id: '5', nameAr: 'كتب وقرطاسية', nameEn: 'Books & Stationery', color: 'indigo' },
  { id: '6', nameAr: 'صحة وجمال', nameEn: 'Health & Beauty', color: 'pink' },
];