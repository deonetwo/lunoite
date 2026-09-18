const DB_NAME = 'lunoite_workspace_db';
const STORE_NAME = 'workspace_handles';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDirectoryHandle(
  key: string,
  handle: FileSystemDirectoryHandle
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(handle, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getDirectoryHandle(
  key: string
): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function clearDirectoryHandle(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Ignore errors when clearing
  }
}

export async function verifyHandlePermission(
  handle: FileSystemHandle,
  readWrite = true
): Promise<boolean> {
  const options = {
    mode: (readWrite ? 'readwrite' : 'read') as 'readwrite' | 'read',
  };

  const extHandle = handle as unknown as {
    queryPermission?: (opts: { mode: string }) => Promise<string>;
    requestPermission?: (opts: { mode: string }) => Promise<string>;
  };

  if (extHandle.queryPermission) {
    const status = await extHandle.queryPermission(options);
    if (status === 'granted') return true;
  }

  if (extHandle.requestPermission) {
    const status = await extHandle.requestPermission(options);
    if (status === 'granted') return true;
  }

  return false;
}
