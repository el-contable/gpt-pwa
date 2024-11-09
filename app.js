import { checkAuthentication } from './auth.js';
import { addChatSession, getAllChatSessions, updateChatSessionName } from './indexedDB.js';

document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) {
    document.body.innerHTML = '<h2>Access Denied</h2><p>Invalid password. Reload the page to try again.</p>';
    return;
  }

  const appElement = document.getElementById('app');

  // Theme setup
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  // Render UI
  appElement.innerHTML = `
    <!-- Sidebar for New Chat and History -->
    <div id="side-panel">
      <div class="new-chat">
        <button id="new-chat-btn">✏️</button>
      </div>
      <div class="chat-history">
        <h3>History</h3>
        <ul id="chat-history-list"></ul>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div id="chat-box">
      <button id="toggle-sidebar-btn">☰</button>
      <div class="intro-message">
        <h2>How can I help you today?</h2>
      </div>
      <div class="chat-input-container">
        <button class="icon-button">📎</button>
        <input type="text" id="chat-input" placeholder="Message ChatGPT..." />
        <button class="send-button">⬆️</button>
      </div>
    </div>
  `;

  // Event listener for new chat button
  document.getElementById('new-chat-btn').addEventListener('click', createNewChatSession);

  // Load and display chat history
  await loadChatHistory();

  async function createNewChatSession() {
    await addChatSession();
    await loadChatHistory();
  }

  async function loadChatHistory() {
    const chatHistoryList = document.getElementById('chat-history-list');
    chatHistoryList.innerHTML = ''; // Clear existing history

    const sessions = await getAllChatSessions();
    sessions.forEach((session) => {
      const listItem = document.createElement('li');
      listItem.textContent = session.name;
      listItem.dataset.id = session.id;
      chatHistoryList.appendChild(listItem);

      listItem.addEventListener('click', () => loadChatSession(session.id));
    });
  }

  function loadChatSession(sessionId) {
    console.log('Loading chat session:', sessionId);
  }

  async function updateSessionNameBasedOnContext(id, message) {
    const contextName = message.slice(0, 20) + (message.length > 20 ? '...' : '');
    await updateChatSessionName(id, contextName);
    await loadChatHistory();
  }

  document.querySelector('.send-button').addEventListener('click', async () => {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (message) {
      const sessions = await getAllChatSessions();
      const lastSession = sessions[sessions.length - 1];
      if (lastSession && lastSession.name === 'New Chat') {
        await updateSessionNameBasedOnContext(lastSession.id, message);
      }
    }
  });
});
