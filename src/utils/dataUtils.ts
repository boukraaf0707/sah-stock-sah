import { Product } from '@/types/product';
import { MissingItem } from '@/types/missing';
import { Sale } from '@/types/sale';

export interface ExportData {
  products: Product[];
  missingItems: MissingItem[];
  sales: Sale[];
  exportDate: string;
  version: string;
}

export const exportUtils = {
  exportToJSON: (data: ExportData): string => {
    return JSON.stringify(data, null, 2);
  },

  downloadJSON: (data: ExportData, filename?: string) => {
    const jsonString = exportUtils.exportToJSON(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `inventory-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  },

  importFromJSON: (jsonString: string): Promise<ExportData> => {
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.parse(jsonString);
        
        // Validate data structure
        if (!data.products || !Array.isArray(data.products)) {
          throw new Error('Invalid data format: products array missing');
        }

        // Convert date strings back to Date objects
        const processedData: ExportData = {
          ...data,
          products: data.products.map((product: any) => ({
            ...product,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt)
          })),
          missingItems: (data.missingItems || []).map((item: any) => ({
            ...item,
            detectedAt: new Date(item.detectedAt),
            resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined
          })),
          sales: (data.sales || []).map((sale: any) => ({
            ...sale,
            createdAt: new Date(sale.createdAt)
          }))
        };

        resolve(processedData);
      } catch (error) {
        reject(new Error(`Failed to parse import data: ${error}`));
      }
    });
  },

  exportToCSV: (products: Product[]): string => {
    const headers = ['ID', 'Name (Arabic)', 'Name (English)', 'Category', 'Quantity', 'Price', 'Supplier', 'Min Stock', 'Created At'];
    const rows = products.map(product => [
      product.id,
      product.nameAr,
      product.nameEn || '',
      product.category,
      product.quantity.toString(),
      product.price.toString(),
      product.supplier || '',
      (product.minStock || '').toString(),
      product.createdAt.toISOString()
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  },

  downloadCSV: (products: Product[], filename?: string) => {
    const csvString = exportUtils.exportToCSV(products);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
};