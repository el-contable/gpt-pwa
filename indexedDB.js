const DB_NAME = "chatGPTApp";
const DB_VERSION = 1;
const CHAT_STORE_NAME = "chats";

let db;

// Initialize IndexedDB
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error:", event.target.errorCode);
      reject("Database failed to open");
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Database opened successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
        db.createObjectStore(CHAT_STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
      console.log("Database setup complete");
    };
  });
}

// Add a new chat session
export function addChatSession(name = "New Chat") {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAT_STORE_NAME], "readwrite");
    const store = transaction.objectStore(CHAT_STORE_NAME);
    const chatSession = {
      name: name,
      timestamp: new Date().toLocaleString(),
    };
    const request = store.add(chatSession);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error adding chat session");
    };
  });
}

// Retrieve all chat sessions
export function getAllChatSessions() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAT_STORE_NAME], "readonly");
    const store = transaction.objectStore(CHAT_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error retrieving chat sessions");
    };
  });
}
