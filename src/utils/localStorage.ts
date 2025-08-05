
import { Product } from '@/types/product';

const STORAGE_KEYS = {
  PRODUCTS: 'sah-stock-products',
  LAST_SYNC: 'sah-stock-last-sync'
};

export const localStorageUtils = {
  saveProducts: (products: Product[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to save products to localStorage:', error);
      return false;
    }
  },

  loadProducts: (): Product[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!stored) return [];
      
      const products = JSON.parse(stored);
      // Convert date strings back to Date objects
      return products.map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
      return [];
    }
  },

  getLastSync: (): Date | null => {
    try {
      const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  },

  clearData: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }
};
