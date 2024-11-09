const DB_NAME = "chatGPTApp";
const DB_VERSION = 2; // Incremented version for new object store
const CHAT_STORE_NAME = "chats";
const MESSAGE_STORE_NAME = "messages";

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
      // Chat sessions store
      if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
        db.createObjectStore(CHAT_STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
      // Messages store
      if (!db.objectStoreNames.contains(MESSAGE_STORE_NAME)) {
        const messageStore = db.createObjectStore(MESSAGE_STORE_NAME, { autoIncrement: true });
        messageStore.createIndex("chatId", "chatId", { unique: false });
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
      resolve(request.result); // Returns the ID of the new chat session
    };

    request.onerror = () => {
      reject("Error adding chat session");
    };
  });
}

// Add a new message to a chat session
export function addMessageToChat(chatId, role, content) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGE_STORE_NAME], "readwrite");
    const store = transaction.objectStore(MESSAGE_STORE_NAME);
    const message = {
      chatId: chatId,
      role: role,
      content: content,
      timestamp: new Date().toLocaleString(),
    };
    const request = store.add(message);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error adding message to chat");
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

// Retrieve all messages for a specific chat session
export function getMessagesByChatId(chatId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGE_STORE_NAME], "readonly");
    const store = transaction.objectStore(MESSAGE_STORE_NAME);
    const index = store.index("chatId");
    const request = index.getAll(chatId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error retrieving messages for chat session");
    };
  });
}

// Delete a single chat session and its messages
export function deleteChatSession(chatId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["chats", "messages"], "readwrite");
    const chatStore = transaction.objectStore("chats");
    const messageStore = transaction.objectStore("messages");

    // Delete the chat session
    const deleteChatRequest = chatStore.delete(chatId);
    deleteChatRequest.onerror = () => reject("Failed to delete chat session");

    // Delete associated messages
    const index = messageStore.index("chatId");
    const deleteMessagesRequest = index.openCursor(chatId);
    deleteMessagesRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    deleteMessagesRequest.onerror = () => reject("Failed to delete messages");
  });
}

// Clear all chat sessions and messages
export function clearChatSessions() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["chats", "messages"], "readwrite");

    const chatStore = transaction.objectStore("chats");
    const clearChatRequest = chatStore.clear();

    const messageStore = transaction.objectStore("messages");
    const clearMessageRequest = messageStore.clear();

    Promise.all([clearChatRequest, clearMessageRequest])
      .then(resolve)
      .catch(reject);
  });
}
