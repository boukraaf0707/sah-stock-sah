
import { Product } from '@/types/product';
import { Sale } from '@/types/sale';
import { MissingItem } from '@/types/missing';
import { indexedDBService } from './indexedDB';

export const localStorageUtils = {
  // Products
  saveProducts: async (products: Product[]): Promise<boolean> => {
    try {
      // Optimize images before saving
      const optimizedProducts = await Promise.all(
        products.map(async (product) => {
          if (product.image && product.image.startsWith('data:')) {
            try {
              const compressedImage = await indexedDBService.compressImage(product.image);
              return { ...product, image: compressedImage };
            } catch (error) {
              console.warn('Failed to compress image for product:', product.id, error);
              return product;
            }
          }
          return product;
        })
      );

      await indexedDBService.bulkPut('products', optimizedProducts);
      await indexedDBService.setMetadata('lastSync', new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to save products to IndexedDB:', error);
      return false;
    }
  },

  loadProducts: async (): Promise<Product[]> => {
    try {
      // Check if migration is needed
      const migrated = await indexedDBService.getMetadata('migratedFromLocalStorage');
      if (!migrated) {
        await indexedDBService.migrateFromLocalStorage();
      }

      const products = await indexedDBService.getAll('products');
      return products.map((product) => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load products from IndexedDB:', error);
      return [];
    }
  },

  getLastSync: async (): Promise<Date | null> => {
    try {
      const lastSync = await indexedDBService.getMetadata('lastSync');
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  },

  clearData: async (): Promise<boolean> => {
    try {
      await Promise.all([
        indexedDBService.clear('products'),
        indexedDBService.clear('sales'),
        indexedDBService.clear('missingItems')
      ]);
      await indexedDBService.setMetadata('lastSync', new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to clear IndexedDB:', error);
      return false;
    }
  },

  // Sales
  saveSales: async (sales: Sale[]): Promise<boolean> => {
    try {
      await indexedDBService.bulkPut('sales', sales);
      return true;
    } catch (error) {
      console.error('Failed to save sales to IndexedDB:', error);
      return false;
    }
  },

  loadSales: async (): Promise<Sale[]> => {
    try {
      const sales = await indexedDBService.getAll('sales');
      return sales.map((sale) => ({
        ...sale,
        createdAt: new Date(sale.createdAt)
      }));
    } catch (error) {
      console.error('Failed to load sales from IndexedDB:', error);
      return [];
    }
  },

  // Missing Items
  saveMissingItems: async (missingItems: MissingItem[]): Promise<boolean> => {
    try {
      // Optimize images before saving
      const optimizedItems = await Promise.all(
        missingItems.map(async (item) => {
          if (item.image && item.image.startsWith('data:')) {
            try {
              const compressedImage = await indexedDBService.compressImage(item.image);
              return { ...item, image: compressedImage };
            } catch (error) {
              console.warn('Failed to compress image for missing item:', item.id, error);
              return item;
            }
          }
          return item;
        })
      );

      await indexedDBService.bulkPut('missingItems', optimizedItems);
      return true;
    } catch (error) {
      console.error('Failed to save missing items to IndexedDB:', error);
      return false;
    }
  },

  loadMissingItems: async (): Promise<MissingItem[]> => {
    try {
      const missingItems = await indexedDBService.getAll('missingItems');
      return missingItems.map((item) => ({
        ...item,
        detectedAt: new Date(item.detectedAt),
        resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to load missing items from IndexedDB:', error);
      return [];
    }
  },

  // Export/Import
  exportAllData: async () => {
    try {
      return await indexedDBService.exportAllData();
    } catch (error) {
      console.error('Failed to export data:', error);
      return { products: [], sales: [], missingItems: [] };
    }
  },

  importAllData: async (data: { products?: Product[]; sales?: Sale[]; missingItems?: MissingItem[] }): Promise<boolean> => {
    try {
      await indexedDBService.importAllData(data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};
