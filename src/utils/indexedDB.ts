import { Product } from '@/types/product';
import { Sale } from '@/types/sale';
import { MissingItem } from '@/types/missing';

const DB_NAME = 'SAHStockDB';
const DB_VERSION = 1;

export interface DBSchema {
  products: Product;
  sales: Sale;
  missingItems: MissingItem;
  metadata: { key: string; value: any; updatedAt: Date };
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('category', 'category', { unique: false });
          productsStore.createIndex('nameAr', 'nameAr', { unique: false });
          productsStore.createIndex('quantity', 'quantity', { unique: false });
          productsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Sales store
        if (!db.objectStoreNames.contains('sales')) {
          const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
          salesStore.createIndex('createdAt', 'createdAt', { unique: false });
          salesStore.createIndex('customerName', 'customerName', { unique: false });
          salesStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
        }

        // Missing items store
        if (!db.objectStoreNames.contains('missingItems')) {
          const missingStore = db.createObjectStore('missingItems', { keyPath: 'id' });
          missingStore.createIndex('priority', 'priority', { unique: false });
          missingStore.createIndex('reason', 'reason', { unique: false });
          missingStore.createIndex('isResolved', 'isResolved', { unique: false });
          missingStore.createIndex('detectedAt', 'detectedAt', { unique: false });
        }

        // Metadata store for sync info
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  // Generic CRUD operations
  async add<T extends keyof DBSchema>(storeName: T, data: DBSchema[T]): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async put<T extends keyof DBSchema>(storeName: T, data: DBSchema[T]): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T extends keyof DBSchema>(storeName: T, id: string): Promise<DBSchema[T] | undefined> {
    const db = await this.initDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T extends keyof DBSchema>(storeName: T): Promise<DBSchema[T][]> {
    const db = await this.initDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete<T extends keyof DBSchema>(storeName: T, id: string): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear<T extends keyof DBSchema>(storeName: T): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Bulk operations for efficiency
  async bulkAdd<T extends keyof DBSchema>(storeName: T, items: DBSchema[T][]): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      let completed = 0;
      let hasError = false;

      items.forEach(item => {
        const request = store.add(item);
        request.onsuccess = () => {
          completed++;
          if (completed === items.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });

      if (items.length === 0) {
        resolve();
      }
    });
  }

  async bulkPut<T extends keyof DBSchema>(storeName: T, items: DBSchema[T][]): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      let completed = 0;
      let hasError = false;

      items.forEach(item => {
        const request = store.put(item);
        request.onsuccess = () => {
          completed++;
          if (completed === items.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });

      if (items.length === 0) {
        resolve();
      }
    });
  }

  // Metadata operations
  async setMetadata(key: string, value: any): Promise<void> {
    await this.put('metadata', { key, value, updatedAt: new Date() });
  }

  async getMetadata(key: string): Promise<any> {
    const result = await this.get('metadata', key);
    return result?.value;
  }

  // Image optimization utility
  compressImage(base64: string, quality: number = 0.8, maxWidth: number = 800): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = base64;
    });
  }

  // Export/Import operations
  async exportAllData(): Promise<{ products: Product[]; sales: Sale[]; missingItems: MissingItem[] }> {
    const [products, sales, missingItems] = await Promise.all([
      this.getAll('products'),
      this.getAll('sales'),
      this.getAll('missingItems')
    ]);

    return { products, sales, missingItems };
  }

  async importAllData(data: { products?: Product[]; sales?: Sale[]; missingItems?: MissingItem[] }): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['products', 'sales', 'missingItems'], 'readwrite');

    try {
      // Clear existing data
      await Promise.all([
        this.clear('products'),
        this.clear('sales'),
        this.clear('missingItems')
      ]);

      // Import new data
      const promises = [];
      if (data.products) promises.push(this.bulkPut('products', data.products));
      if (data.sales) promises.push(this.bulkPut('sales', data.sales));
      if (data.missingItems) promises.push(this.bulkPut('missingItems', data.missingItems));

      await Promise.all(promises);
      await this.setMetadata('lastSync', new Date().toISOString());
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }

  // Migration from localStorage
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const localProducts = localStorage.getItem('sah-stock-products');
      if (localProducts) {
        const products: Product[] = JSON.parse(localProducts).map((product: any) => ({
          ...product,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt)
        }));
        
        await this.bulkPut('products', products);
        await this.setMetadata('migratedFromLocalStorage', true);
        await this.setMetadata('lastSync', new Date().toISOString());
        
        console.log(`Migrated ${products.length} products from localStorage to IndexedDB`);
      }
    } catch (error) {
      console.error('Migration from localStorage failed:', error);
    }
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();

// Initialize on module load
indexedDBService.initDB().catch(console.error);