export interface MissingItem {
  id: string;
  productId?: string; // Reference to original product if auto-detected
  nameAr: string;
  nameEn?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: 'out_of_stock' | 'damaged' | 'lost' | 'other';
  description?: string;
  image?: string;
  supplier?: string;
  estimatedPrice?: number;
  detectedAt: Date;
  resolvedAt?: Date;
  isResolved: boolean;
}

export interface MissingItemForm {
  nameAr: string;
  nameEn?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: 'out_of_stock' | 'damaged' | 'lost' | 'other';
  description?: string;
  image?: string;
  supplier?: string;
  estimatedPrice?: number;
}

export const PRIORITY_LABELS = {
  low: 'منخفضة',
  medium: 'متوسطة', 
  high: 'عالية',
  urgent: 'عاجلة'
};

export const REASON_LABELS = {
  out_of_stock: 'نفاد المخزون',
  damaged: 'تالف',
  lost: 'مفقود',
  other: 'أخرى'
};