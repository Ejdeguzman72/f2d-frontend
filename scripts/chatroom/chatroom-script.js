const messageInfo = {
    content: "",
    sender: "",
}

const token = localStorage.getItem('F2DToken');

// const verifyUser = async (username) => {
//     const verifiedUser = await axios.get(`http://192.168.1.54:8080/users/search/username/${username}`);
//     console.log('Verified User: ', verifiedUser);
//     return verifiedUser;
// }

// Function to format timestamps
function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Function to display messages in the chat
function displayMessage(sender, content, timestamp) {
    const messagesDiv = document.getElementById('messages');

    // Create a new message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = `[${timestamp}] ${sender}: ${content}`;

    // Append the message to the chat container
    messagesDiv.appendChild(messageElement);

    // Scroll to the bottom of the chat
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to initialize the WebSocket connection
function initializeWebSocket() {
    const token = localStorage.getItem('F2DToken');
    if (!token) {
        console.log("Token not found in local storage.");
        alert('Please log in to use the chat.');
        return;
    }

    let username;
    try {
        console.log("Decoding JWT token...");
        const decoded = jwt_decode(token);

        // Check if the token is expired
        if (decoded.exp * 1000 < Date.now()) {
            alert('Session expired. Please log in again.');
            console.log("Token has expired.");
            return;
        }

        console.log("Token is valid. Fetching user details...");
        username = decoded.sub;
        console.log('Username: ', username);

    } catch (error) {
        console.error('Failed to decode JWT token:', error);
        alert('Invalid session. Please log in again.');
        return;
    }

    // Establish the WebSocket connection
    const socket = new WebSocket(`ws://192.168.1.54:8083/f2d-chat?token=${token}`);

    // WebSocket event handlers
    socket.onopen = () => {
        console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
        let message;

        try {
            const jsonStartIndex = event.data.indexOf('{');
            if (jsonStartIndex !== -1) {
                const jsonString = event.data.substring(jsonStartIndex);
                message = JSON.parse(jsonString);
                console.log('Parsed message:', message);

                // Display the parsed message
                displayMessage(message.sender, message.content, formatTimestamp(message.timestamp));
            } else {
                console.warn('No JSON found in message:', event.data);
            }
        } catch (e) {
            console.error("Failed to parse JSON:", e);
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
            const message = {
                sender: username,
                content: messageInput.value,
                timestamp: new Date().toISOString(),
            };

            // Send the message as a JSON string
            socket.send(JSON.stringify(message));
            messageInput.value = ''; // Clear the input field
        });
    } else {
        console.error('Send button or message input is not found in the DOM.');
    }
}

// Initialize WebSocket connection
initializeWebSocket();
