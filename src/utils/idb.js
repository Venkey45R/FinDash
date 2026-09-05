/**
 * IndexedDB wrapper for FinDash state persistence.
 * Replaces localStorage to avoid the ~5MB quota limit.
 * Falls back to localStorage if IndexedDB is unavailable.
 *
 * State keys are scoped by userId so that multiple users on the
 * same browser never share or accidentally see each other's cached data.
 */

const DB_NAME = 'fin-dash-db';
const DB_VERSION = 1;
const STORE_NAME = 'state';

/**
 * Derive a storage key scoped to a specific user.
 * Falls back to a generic key only when no userId is available.
 * @param {string|null|undefined} userId
 * @returns {string}
 */
function getStateKey(userId) {
  return userId ? `financeState_${userId}` : 'financeState';
}

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
 * Save finance state to IndexedDB, scoped by userId.
 * Falls back to localStorage on failure.
 * @param {Object} state - The state object to persist
 * @param {string} userId - The current user's ID (used to scope the key)
 */
export async function saveState(state, userId) {
  const key = getStateKey(userId);
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(state, key);
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
      localStorage.setItem(`fin-dash-state_${key}`, JSON.stringify(state));
    } catch {
      // Quota exceeded or other error — silently fail
    }
  }
}

/**
 * Load finance state from IndexedDB for a specific user.
 * Falls back to localStorage.
 * @param {string} userId - The current user's ID (used to scope the key)
 * @returns {Promise<Object|null>}
 */
export async function loadState(userId) {
  const key = getStateKey(userId);
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
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
      const raw = localStorage.getItem(`fin-dash-state_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Clear persisted state for a specific user from IndexedDB and localStorage.
 * Pass no userId to clear the legacy unscoped key as well.
 * @param {string|null|undefined} userId
 */
export async function clearState(userId) {
  const keysToDelete = [getStateKey(userId)];
  // Also clear the old unscoped legacy key in case it still exists
  if (userId) keysToDelete.push('financeState');

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const k of keysToDelete) {
      store.delete(k);
    }
    tx.oncomplete = () => db.close();
  } catch {
    // ignore
  }
  // Also clean up all localStorage variants
  try {
    for (const k of keysToDelete) {
      localStorage.removeItem(`fin-dash-state_${k}`);
    }
    // Legacy key without prefix
    localStorage.removeItem('fin-dash-state');
  } catch {
    // ignore
  }
}
