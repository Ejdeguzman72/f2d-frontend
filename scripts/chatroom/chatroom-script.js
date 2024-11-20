// Establish a WebSocket connection
const socket = new WebSocket('ws://192.168.1.54:8083/ws/default');

// Log when the WebSocket connection is opened
socket.onopen = () => {
    console.log('WebSocket connection established');
};

// Handle incoming messages
socket.onmessage = (event) => {
    console.log("Raw message:", event.data);

    try {
        // Attempt to parse the message as JSON
        const chatMessage = JSON.parse(event.data);

        // Display the parsed message
        displayMessage(chatMessage.sender, chatMessage.content, chatMessage.timestamp);
    } catch (e) {
        // Log the error and handle non-JSON messages as plain text
        console.error("Failed to parse JSON:", e);

        // Display the raw message with a default timestamp
        displayMessage("Server", event.data, new Date().toISOString());
    }
};

// Log any errors that occur
socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// Log when the WebSocket connection is closed
socket.onclose = () => {
    console.log('WebSocket connection closed');
};

// Function to send a message
document.getElementById('sendButton').addEventListener('click', () => {
    const messageInput = document.getElementById('messageInput');
    const message = {
        sender: 'User', // Replace with dynamic username later
        content: messageInput.value,
        timestamp: new Date().toISOString(),
    };

    // Send the message as a JSON string
    socket.send(JSON.stringify(message));
    messageInput.value = ''; // Clear the input field
});

// Function to display messages in the chat
function displayMessage(sender, content, timestamp) {
    const messagesDiv = document.getElementById('messages');

    // Create a new message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = `[${timestamp}] ${sender}: ${content}`;

    // Append the message to the chat container
    messagesDiv.appendChild(messageElement);

    // Optionally scroll to the bottom of the chat
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
