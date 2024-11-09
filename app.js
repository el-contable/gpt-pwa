import { initDB, addChatSession, getAllChatSessions } from "./indexedDB.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  // Sidebar and main chat area structure
  app.innerHTML = `
    <div id="sidebar" class="open">
      <div class="new-chat-btn">+ New Chat</div>
      <div class="chat-history-container">
        <!-- Chat history items will go here -->
      </div>
    </div>
    <div id="chat-container">
      <div class="chat-box">
        <div class="intro-message">How can I help you today?</div>
      </div>
      <div class="input-area">
        <input type="text" id="user-input" placeholder="Message ChatGPT...">
        <input type="file" id="upload-image" style="display: none;">
        <button id="upload-btn" class="upload-icon">📎</button>
        <button id="send-btn">Send</button>
      </div>
    </div>
  `;

  // Initialize Database
  await initDB();
  loadChatHistory();

  // Event Listeners
  document.querySelector(".new-chat-btn").addEventListener("click", async () => {
    const chatId = await addChatSession();
    createChatHistoryItem(chatId, "New Chat");
  });

  document.getElementById("upload-btn").addEventListener("click", () => {
    document.getElementById("upload-image").click();
  });

  // Load and display chat history from IndexedDB
  async function loadChatHistory() {
    const chatHistoryContainer = document.querySelector(".chat-history-container");
    const chats = await getAllChatSessions();

    chats.forEach(chat => {
      createChatHistoryItem(chat.id, chat.name, chat.timestamp);
    });
  }

  // Function to create a chat history item in the sidebar
  function createChatHistoryItem(id, name, timestamp = "") {
    const chatHistoryContainer = document.querySelector(".chat-history-container");
    const chatItem = document.createElement("div");
    chatItem.classList.add("chat-history-item");
    chatItem.dataset.chatId = id;
    chatItem.innerText = `${name} - ${timestamp}`;
    chatHistoryContainer.appendChild(chatItem);
  }
});
