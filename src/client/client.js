const socket = io('http://localhost:3000');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');

// Add message to UI
function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('clientMessage', message);
    addMessage(message, 'client');
    messageInput.value = '';
}

// Handle admin messages
socket.on('adminMessage', (message) => {
    addMessage(message, 'admin');
});

document.addEventListener('DOMContentLoaded', () => {
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
