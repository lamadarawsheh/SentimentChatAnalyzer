const socket = io("http://localhost:3000");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messages");
const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");
const voiceIndicator = voiceStatus.querySelector(".voice-indicator");

// Voice recognition setup
let recognition;
let isListening = false;

function startVoiceRecognition() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("عذراً، ميزة التعرف على الصوت غير مدعومة في متصفحك");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "ar-SA"; // Arabic language

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    messageInput.value = transcript;
    sendMessage();
  };

  recognition.onerror = function (event) {
    console.error("خطأ في التعرف على الصوت:", event.error);
    voiceStatus.textContent = "حدث خطأ في التعرف على الصوت";
  };

  recognition.onend = function () {
    isListening = false;
    voiceBtn.classList.remove("recording");
    voiceStatus.textContent = "اضغط للتسجيل";
  };
}

// Add message to UI
function addMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.className = `message ${sender}`;
  messageElement.textContent = message;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  socket.emit("clientMessage", message);
  addMessage(message, "client");
  messageInput.value = "";
}

// Handle admin messages
socket.on("adminMessage", (message) => {
  if (!message) return; // Don't process empty messages
  addMessage(message, "admin");
});

// Handle client messages (from other clients)
socket.on("clientMessage", (message) => {
  if (!message) return; // Don't process empty messages
  addMessage(message, "client");
});

// Initialize voice recognition and event listeners
document.addEventListener("DOMContentLoaded", () => {
  if ("webkitSpeechRecognition" in window) {
    startVoiceRecognition();
  }

  // Event listeners
  sendBtn.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  voiceBtn.addEventListener("click", () => {
    if (!isListening) {
      recognition.start();
      isListening = true;
      voiceBtn.classList.add("recording");
      voiceStatus.textContent = "جاري التسجيل...";
    } else {
      recognition.stop();
    }
  });
});
