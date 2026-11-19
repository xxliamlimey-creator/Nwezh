const DB_NAME = 'nwezh-media';
const STORE_NAME = 'custom-sounds';
const CUSTOM_SOUND_KEY = 'primary-custom-sound';

export interface StoredCustomSound {
  name: string;
  type: string;
  size: number;
  blob: Blob;
  updatedAt: number;
}

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open audio store.'));
  });
}

export async function saveCustomSoundFile(file: File): Promise<StoredCustomSound> {
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Audio file must be 15 MB or smaller.');
  }
  const db = await openMediaDB();
  const entry: StoredCustomSound = {
    name: file.name,
    type: file.type || 'audio/mpeg',
    size: file.size,
    blob: file,
    updatedAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(entry, CUSTOM_SOUND_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Failed to save audio file.'));
  });
  db.close();
  return entry;
}

export async function loadCustomSoundFile(): Promise<StoredCustomSound | null> {
  try {
    const db = await openMediaDB();
    const result = await new Promise<StoredCustomSound | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(CUSTOM_SOUND_KEY);
      req.onsuccess = () => resolve((req.result as StoredCustomSound) || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}

export async function deleteCustomSoundFile(): Promise<void> {
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(CUSTOM_SOUND_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore
  }
}
