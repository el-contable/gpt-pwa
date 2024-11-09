import {
  initDB,
  addChatSession,
  getAllChatSessions,
  addMessageToChat,
  getMessagesByChatId,
  deleteChatSession,
  clearChatSessions,
} from "./indexedDB.js";
import { sendMessage } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  // Sidebar and main chat area structure with sidebar toggle button
  app.innerHTML = `
    <div class="sidebar-toggle">☰</div>
    <div id="sidebar" class="open">
      <div class="new-chat-btn">+ New Chat</div>
      <div class="clear-all-btn">🗑️ Clear All Chats</div>
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

  // Sidebar Toggle Logic for Mobile
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebar = document.getElementById("sidebar");

  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  document.querySelector(".new-chat-btn").addEventListener("click", createNewChat);
  document.querySelector(".clear-all-btn").addEventListener("click", clearAllChats);

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

      // Show typing indicator
      showTypingIndicator();

      try {
        const response = await sendMessage(userInput);
        await addMessageToChat(chatId, "bot", response); // Save bot's message
        removeTypingIndicator(); // Remove typing indicator once response is received
        addMessageToChatBox("bot", response); // Display bot's response
      } catch (error) {
        console.error("Error:", error);
        removeTypingIndicator(); // Remove typing indicator on error
        addMessageToChatBox("bot", "Error: Unable to retrieve response. Please try again.");
      }

      if (isFirstMessage(chatId)) {
        updateChatTitle(chatId, userInput);
      }
    }
  });

  async function loadChatHistory() {
    const chatHistoryContainer = document.querySelector(".chat-history-container");
    chatHistoryContainer.innerHTML = ""; // Clear existing content
    const chats = await getAllChatSessions();

    chats.forEach(chat => {
      createChatHistoryItem(chat.id, chat.name, chat.timestamp);
    });
  }

  function createNewChat() {
    addChatSession().then(chatId => {
      createChatHistoryItem(chatId, "New Chat"); // Adds chat to the sidebar
      selectChat(chatId); // Automatically selects the new chat
    });
  }

  function createChatHistoryItem(id, name, timestamp = "") {
    const chatHistoryContainer = document.querySelector(".chat-history-container");
    const chatItem = document.createElement("div");
    chatItem.classList.add("chat-history-item");
    chatItem.dataset.chatId = id;

    const chatTitle = document.createElement("span");
    chatTitle.innerText = `${name} - ${timestamp}`;
    chatItem.appendChild(chatTitle);

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "🗑️";
    deleteButton.classList.add("delete-chat");
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent selecting the chat
      deleteChat(id);
    });
    chatItem.appendChild(deleteButton);

    chatItem.addEventListener("click", () => loadChatSession(id));
    chatHistoryContainer.appendChild(chatItem);
  }

  async function loadChatSession(chatId) {
    selectChat(chatId); // Sets the chat as active
    const chatBox = document.querySelector(".chat-box");
    chatBox.innerHTML = ""; // Clear existing messages
    const messages = await getMessagesByChatId(chatId);
    messages.forEach(msg => {
      addMessageToChatBox(msg.role, msg.content);
    });
  }

  async function deleteChat(chatId) {
    await deleteChatSession(chatId); // Delete chat from IndexedDB
    document.querySelector(`.chat-history-item[data-chat-id="${chatId}"]`).remove(); // Remove from UI
    if (getCurrentChatId() === chatId) {
      document.querySelector(".chat-box").innerHTML = "<div class='intro-message'>Chat has been deleted.</div>";
    }
  }

  async function clearAllChats() {
    await clearChatSessions(); // Clear all chats in IndexedDB
    document.querySelector(".chat-history-container").innerHTML = ""; // Clear UI
    document.querySelector(".chat-box").innerHTML = "<div class='intro-message'>All chats have been cleared.</div>";
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

  function selectChat(chatId) {
    document.querySelectorAll(".chat-history-item").forEach(item => {
      item.classList.remove("selected");
      if (item.dataset.chatId == chatId) item.classList.add("selected");
    });
  }

  function isFirstMessage(chatId) {
    const selectedChat = document.querySelector(`.chat-history-item[data-chat-id="${chatId}"]`);
    return selectedChat && selectedChat.innerText === "New Chat";
  }

  function updateChatTitle(chatId, newTitle) {
    const selectedChat = document.querySelector(`.chat-history-item[data-chat-id="${chatId}"]`);
    if (selectedChat) {
      selectedChat.innerText = newTitle;

      // Update the title in IndexedDB
      addChatSession(newTitle).then(updatedTitle => {
        selectedChat.innerText = updatedTitle;
      });
    }
  }

  // Show typing indicator
  function showTypingIndicator() {
    const chatBox = document.querySelector(".chat-box");
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("message", "bot", "typing-indicator");
    typingIndicator.innerText = "Typing...";
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
});
