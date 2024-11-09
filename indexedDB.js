// indexedDB.js
const DB_NAME = 'ChatGPTApp';
const DB_VERSION = 1;
const STORE_NAME = 'chatSessions';

// Open or create IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Add a new chat session to IndexedDB
async function addChatSession(sessionName = 'New Chat') {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const newSession = {
    name: sessionName,
    lastAccessed: new Date().toISOString()
  };
  store.add(newSession);
  return tx.complete;
}

// Get all chat sessions from IndexedDB
async function getAllChatSessions() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return store.getAll();
}

// Update a chat session name based on context
async function updateChatSessionName(id, newName) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const session = await store.get(id);
  session.name = newName;
  store.put(session);
  return tx.complete;
}

export { addChatSession, getAllChatSessions, updateChatSessionName };
