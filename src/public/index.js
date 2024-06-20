// Public/index.js

const socket = io('http://localhost:3010');

// Escuchar historial de mensajes
socket.on('previousMessages', (messages) => {
    messages.forEach(message => {
        displayMessage(message.username, message.message);
    });
});

// Mostrar mensajes recibidos
socket.on('messageFromServer', (data) => {
    displayMessage(data.user, data.message);
});

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    socket.emit('messageFromClient', message);
    messageInput.value = '';
}

function displayMessage(username, message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${username}: ${message}`;
    messagesDiv.appendChild(messageElement);
}
