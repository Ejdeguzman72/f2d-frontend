const token = localStorage.getItem('F2DToken');
let historyVisible = false; // Track whether history is visible

// Function to format timestamps
function formatTimestamp(isoTimestamp) {
    if (!isoTimestamp) return "Unknown Time";
    const date = new Date(isoTimestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ` +
           `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// Function to display messages in the chat
function displayMessage(sender, content, timestamp) {
    if (!sender) sender = "Unknown";
    if (!content) content = "[No Content]";

    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = `[${timestamp}] ${sender}: ${content}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to bottom
}

// Function to fetch and display chat history
async function fetchChatHistory() {
    try {
        const response = await fetch('http://192.168.1.54:8083/chatroom/chat-messages/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch chat history. Status: ${response.status}`);
        }

        const messages = await response.json();
        const messagesDiv = document.getElementById('messages');

        if (!historyVisible) {
            messagesDiv.innerHTML = "";
            messages.list.forEach(msg => {
                displayMessage(msg.sender, msg.content, formatTimestamp(msg.sentDatetime));
            });
            document.getElementById('historyButton').textContent = "Hide Chat History";
        } else {
            messagesDiv.innerHTML = "";
            document.getElementById('historyButton').textContent = "Show Chat History";
        }

        historyVisible = !historyVisible;
    } catch (error) {
        console.error("Error fetching chat history:", error);
    }
}

// Function to initialize the WebSocket connection
function initializeWebSocket() {
    if (!token) {
        console.log("Token not found in local storage.");
        alert('Please log in to use the chat.');
        return;
    }

    let username;
    try {
        console.log("Decoding JWT token...");
        const decoded = jwt_decode(token);

        if (decoded.exp * 1000 < Date.now()) {
            alert('Session expired. Please log in again.');
            return;
        }

        username = decoded.sub;
        console.log('Username:', username);
    } catch (error) {
        console.error('Failed to decode JWT token:', error);
        alert('Invalid session. Please log in again.');
        return;
    }

    // Establish the WebSocket connection
    const socket = new WebSocket(`ws://192.168.1.54:8083/chatroom/f2d-chat?token=${token}`);

    socket.onopen = () => {
        console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
        console.log('Raw WebSocket message:', event.data); // Debug log

        try {
            let data = event.data.trim();

            // Check if message starts with the prefix "[f2d]: "
            const prefix = "[f2d]: ";
            if (data.startsWith(prefix)) {
                data = data.substring(prefix.length); // Remove the prefix
            }

            if (data.startsWith('{') || data.startsWith('[')) { // Basic JSON check
                const message = JSON.parse(data);
                const timestamp = message.timestamp || new Date().toISOString();
                displayMessage(message.sender || "Unknown", message.content || "[No Content]", formatTimestamp(timestamp));
            } else {
                // Handle non-JSON messages separately
                displayMessage("System", data, formatTimestamp(new Date().toISOString()));
            }
        } catch (e) {
            console.warn("Invalid JSON message:", event.data);
            displayMessage("Unknown", event.data, formatTimestamp(new Date().toISOString()));
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('Connection error. Please try again later.');
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
        alert('Connection closed. Please refresh to reconnect.');
    };

    // Send message handler
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');

    if (sendButton && messageInput) {
        sendButton.addEventListener('click', () => {
            if (!messageInput.value.trim()) return; // Prevent sending empty messages

            // Send the message as a plain string
            socket.send(JSON.stringify({
                sender: username,
                content: messageInput.value,
                timestamp: new Date().toISOString()
            }));

            messageInput.value = ''; // Clear the input field
        });
    } else {
        console.error('Send button or message input is not found in the DOM.');
    }
}

// Initialize WebSocket connection
initializeWebSocket();

// Attach event listener for chat history toggle button
document.addEventListener("DOMContentLoaded", function () {
    const historyButton = document.getElementById('historyButton');
    if (historyButton) {
        historyButton.addEventListener('click', fetchChatHistory);
    }
});
