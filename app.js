import { initDB, addChatSession, getAllChatSessions, addMessageToChat, getMessagesByChatId } from "./indexedDB.js";
import { sendMessage } from "./api.js"; // Import sendMessage function

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

  await initDB();
  loadChatHistory();

  document.querySelector(".new-chat-btn").addEventListener("click", async () => {
    const chatId = await addChatSession();
    createChatHistoryItem(chatId, "New Chat");
  });

  document.getElementById("upload-btn").addEventListener("click", () => {
    document.getElementById("upload-image").click();
  });

  document.getElementById("send-btn").addEventListener("click", async () => {
    const userInput = document.getElementById("user-input").value;
    if (userInput.trim()) {
      const chatId = getCurrentChatId();
      await addMessageToChat(chatId, "user", userInput); // Save user's message
      addMessageToChatBox("user", userInput); // Display user's message
      document.getElementById("user-input").value = ""; // Clear input

      const response = await sendMessage(userInput);
      await addMessageToChat(chatId, "bot", response); // Save bot's message
      addMessageToChatBox("bot", response); // Display bot's response
    }
  });

  async function loadChatHistory() {
    const chatHistoryContainer = document.querySelector(".chat-history-container");
    const chats = await getAllChatSessions();

    chats.forEach(chat => {
      createChatHistoryItem(chat.id, chat.name, chat.timestamp);
    });
  }

  function createChatHistoryItem(id, name, timestamp = "") {
    const chatHistoryContainer = document.querySelector(".chat-history-container");
    const chatItem = document.createElement("div");
    chatItem.classList.add("chat-history-item");
    chatItem.dataset.chatId = id;
    chatItem.innerText = `${name} - ${timestamp}`;
    chatItem.addEventListener("click", () => loadChatSession(id));
    chatHistoryContainer.appendChild(chatItem);
  }

  async function loadChatSession(chatId) {
    const chatBox = document.querySelector(".chat-box");
    chatBox.innerHTML = ""; // Clear existing messages
    const messages = await getMessagesByChatId(chatId);
    messages.forEach(msg => {
      addMessageToChatBox(msg.role, msg.content);
    });
  }

  function addMessageToChatBox(role, message) {
    const chatBox = document.querySelector(".chat-box");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", role);
    messageElement.innerText = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
  }

  function getCurrentChatId() {
    const selectedChat = document.querySelector(".chat-history-item.selected");
    return selectedChat ? selectedChat.dataset.chatId : null;
  }
});
