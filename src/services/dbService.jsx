const DB_NAME = "KintsugiDB";
const STORE_NAME = "memories";
const DB_VERSION = 2; // 建議升級版本號，確保全新的欄位結構（如 contentType）能被正確初始化

export const initDB = () => {
  return new Promise((resolve, reject) => {
    // 瀏覽器環境檢查
    if (!window.indexedDB) {
      reject("您的瀏覽器不支援 IndexedDB");
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // 使用 id 作為 key，並自動遞增
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

/** 儲存記憶 */
export const saveMemoryToDB = async (memory) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // memory 物件現在會包含：name, content(Base64), contentType, prompt, samples 等
    const request = store.add(memory);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => {
      console.error("IndexedDB Add Error:", event.target.error);
      reject(event.target.error);
    };
  });
};

/** 讀取所有記憶 */
export const getAllMemoriesFromDB = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

/** 讀取特定 ID 的記憶 */
export const getMemoryByIdFromDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    // 確保傳入的是數字類型，因為 autoIncrement 生成的是數字
    const numericId = Number(id);
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(numericId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

/** 刪除記憶 */
export const deleteMemoryFromDB = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const numericId = Number(id);
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(numericId);
    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
};