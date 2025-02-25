document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket("ws://192.168.1.54:8083/f2d-chat");

    const sendButton = document.getElementById("sendButton");
    const messageInput = document.getElementById("messageInput");
    const usernameInput = document.getElementById("usernameInput");
    const messagesDiv = document.getElementById("messages");

    sendButton.disabled = true; // Disable send button initially

    socket.onopen = () => {
        console.log("Connected to WebSocket server");
        sendButton.disabled = false; // Enable send button once WebSocket is open
    };

    socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            displayMessage(`${message.username}: ${message.message}`);
        } catch (e) {
            console.error("Error parsing the message:", e);
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        alert("There was an error with the WebSocket connection. Please try again.");
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed");
        alert("Connection closed. Please refresh the page to reconnect.");
    };

    sendButton.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        const message = messageInput.value.trim();

        if (username && message) {
            const chatMessage = { username: username, message: message };
            socket.send(JSON.stringify(chatMessage));
            messageInput.value = ""; // Clear input field
        }
    });

    function displayMessage(message) {
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
});
