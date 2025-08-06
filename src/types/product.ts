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
  { id: '1', nameAr: 'ضواغط التبريد', nameEn: 'Compressors', color: 'blue' },
  { id: '2', nameAr: 'غازات التبريد', nameEn: 'Refrigerants', color: 'cyan' },
  { id: '3', nameAr: 'أدوات السباكة', nameEn: 'Plumbing Tools', color: 'green' },
  { id: '4', nameAr: 'أدوات كهربائية', nameEn: 'Electrical Tools', color: 'yellow' },
  { id: '5', nameAr: 'مواسير ووصلات', nameEn: 'Pipes & Fittings', color: 'orange' },
  { id: '6', nameAr: 'أجهزة قياس', nameEn: 'Measuring Instruments', color: 'purple' },
  { id: '7', nameAr: 'قطع غيار تبريد', nameEn: 'HVAC Parts', color: 'indigo' },
  { id: '8', nameAr: 'عدد يدوية', nameEn: 'Hand Tools', color: 'gray' },
  { id: '9', nameAr: 'مواد عازلة', nameEn: 'Insulation Materials', color: 'teal' },
  { id: '10', nameAr: 'كابلات ومفاتيح', nameEn: 'Cables & Switches', color: 'red' },
];