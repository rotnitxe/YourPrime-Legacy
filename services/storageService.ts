
// services/storageService.ts

const DB_NAME = 'YourPrimeDB';
const STORE_NAME = 'keyval';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
  return dbPromise;
}

export const storageService = {
  async set(key: string, value: any): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        // IndexedDB supports structured cloning, allowing us to store objects directly.
        const request = store.put(value, key);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
            console.error(`Error setting key ${key}:`, transaction.error);
            reject(transaction.error);
        };
      });
    } catch (e) {
      console.error(`Error setting key "${key}" in IndexedDB`, e);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result === undefined ? null : request.result as T);
        };
        request.onerror = () => {
             console.error(`Error getting key ${key}:`, request.error);
             reject(request.error);
        };
      });
    } catch (e) {
      console.error(`Error getting key "${key}" from IndexedDB`, e);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error(`Error removing key "${key}" from IndexedDB`, e);
    }
  },
  
  async getAllKeys(): Promise<string[]> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = () => {
            // IDB returns keys as IDBValidKey[], we assume string keys for this app
            resolve((request.result as string[]) || []);
        };
        request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("Error getting all keys from IndexedDB", e);
        return [];
    }
  },

  async getAllDataForExport(): Promise<Record<string, any>> {
    const keys = await this.getAllKeys();
    const data: Record<string, any> = {};
    // Keys that are relevant for export
    const relevantKeys = ['programs', 'history', 'yourprime-settings', 'body-progress', 'nutrition-logs', 'skipped-logs', 'yourprime-pantry-items', 'yourprime-tasks', 'yourprime-playlists', 'yourprime-exercise-database', 'yourprime-muscle-group-data', 'yourprime-muscle-hierarchy'];
    
    for (const key of keys) {
      if (relevantKeys.includes(key) || key.startsWith('yourprime-')) {
         data[key] = await this.get(key);
      }
    }
    // Ensure consistent naming for export file (legacy support)
    if(data['yourprime-settings']) {
      data['settings'] = data['yourprime-settings'];
      delete data['yourprime-settings'];
    }
    return data;
  }
};
