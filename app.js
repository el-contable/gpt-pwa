import { sendMessage } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  // Handle send button click and Enter key submission
  sendBtn.addEventListener("click", sendUserMessage);
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendUserMessage();
    }
  });

  async function sendUserMessage() {
    const message = userInput.value.trim();
    console.log("Message:", message); // Log the user input

    if (message) {
      addMessage("user", message);
      userInput.value = "";

      // Show typing indicator
      const typingIndicator = addTypingIndicator();

      try {
        console.log("Sending message to OpenAI API"); // Log API call
        const response = await sendMessage(message); // Send to OpenAI
        console.log("API Response:", response); // Log response

        removeTypingIndicator(typingIndicator);
        addMessage("bot", response);
      } catch (error) {
        console.error("API Error:", error);
        removeTypingIndicator(typingIndicator);
        addMessage("bot", "Error: Unable to retrieve response. Please try again.");
      }
    }
  }

  // Function to add a message to the chat container
  function addMessage(role, content) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", role);
    messageElement.innerText = content;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
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
