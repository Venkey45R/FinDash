/**
 * IndexedDB wrapper for FinDash state persistence.
 * Replaces localStorage to avoid the ~5MB quota limit.
 * Falls back to localStorage if IndexedDB is unavailable.
 */

const DB_NAME = 'fin-dash-db';
const DB_VERSION = 1;
const STORE_NAME = 'state';
const STATE_KEY = 'financeState';

/**
 * Open (or create) the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save finance state to IndexedDB. Falls back to localStorage on failure.
 * @param {Object} state - The state object to persist
 */
export async function saveState(state) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(state, STATE_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // Fallback to localStorage
    try {
      localStorage.setItem('fin-dash-state', JSON.stringify(state));
    } catch {
      // Quota exceeded or other error — silently fail
    }
  }
}

/**
 * Load finance state from IndexedDB. Falls back to localStorage.
 * @returns {Promise<Object|null>}
 */
export async function loadState() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(STATE_KEY);
      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem('fin-dash-state');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Clear persisted state from IndexedDB and localStorage.
 */
export async function clearState() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(STATE_KEY);
    tx.oncomplete = () => db.close();
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem('fin-dash-state');
  } catch {
    // ignore
  }
}
