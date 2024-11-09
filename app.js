import { sendMessage } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  // Handle send button click
  sendBtn.addEventListener("click", async () => {
    const message = userInput.value.trim();
    if (message) {
      addMessage("user", message);
      userInput.value = "";

      // Show typing indicator
      const typingIndicator = addTypingIndicator();

      try {
        // Send message to OpenAI API and get response
        const response = await sendMessage(message);
        removeTypingIndicator(typingIndicator); // Remove typing indicator
        addMessage("bot", response); // Display bot's response
      } catch (error) {
        removeTypingIndicator(typingIndicator); // Remove typing indicator on error
        addMessage("bot", "Error: Unable to retrieve response. Please try again."); // Display error message
        console.error("API Error:", error); // Log error for debugging
      }
    }
  });

  // Function to add a message to the chat container
  function addMessage(role, content) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", role);
    messageElement.innerText = content;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to bottom
  }

  // Function to show typing indicator
  function addTypingIndicator() {
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("message", "bot", "typing-indicator");
    typingIndicator.innerText = "Typing...";
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingIndicator;
  }

  // Function to remove typing indicator
  function removeTypingIndicator(indicator) {
    if (indicator) {
      indicator.remove();
    }
  }
});
