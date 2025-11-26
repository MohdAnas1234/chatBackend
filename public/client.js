const socket = io();

// Set the username when the user joins the chat
function setUsername() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        socket.emit('set username', username);
        document.getElementById('username').disabled = true;
        document.querySelector('button[onclick="setUsername()"]').disabled = true;
        document.getElementById('message').disabled = false;
        document.querySelector('button[onclick="sendMessage()"]').disabled = false;
    }
}

// Send a chat message to the server
function sendMessage() {
    const input = document.getElementById('message');
    const message = input.value.trim();
    if (message) {
        socket.emit('chat message', message);
        input.value = ''; // Clear input field
    }
}

// Load the notification sound
const messageTone = new Audio('/smsTone.mp3'); // Path to the audio file

// Play the notification sound
function playTone() {
    messageTone.play().catch((error) => {
        console.error("Unable to play sound:", error);
    });
}

// Prevent duplicate message handling
const processedMessages = new Set();

// Listen for incoming chat messages
socket.on('chat message', (data) => {
    const messageId = `${data.username}-${data.message}-${Date.now()}`;
    if (!processedMessages.has(messageId)) {
        processedMessages.add(messageId);

        const li = document.createElement('li');
        li.textContent = `${data.username}: ${data.message}`;
        document.getElementById('messages').appendChild(li);
        playTone(); // Play tone on receiving a message
    }
});

// Listen for user connections
socket.on('user connected', (username) => {
    const userList = document.getElementById('user-list');
    if (!document.getElementById(`user-${username}`)) {
        const li = document.createElement('li');
        li.textContent = username;
        li.setAttribute('id', `user-${username}`);
        userList.appendChild(li);

        // Optionally, play a notification sound for user joining
        playTone();
    }
});

// Listen for user disconnections
socket.on('user disconnected', (username) => {
    const userList = document.getElementById('user-list');
    const userItem = document.getElementById(`user-${username}`);
    if (userItem) {
        userList.removeChild(userItem);

        const msg = document.createElement('li');
        msg.textContent = `${username} has left the chat.`;
        msg.style.fontStyle = 'italic';
        document.getElementById('messages').appendChild(msg);
        playTone(); // Play tone on user disconnection
    }
});
