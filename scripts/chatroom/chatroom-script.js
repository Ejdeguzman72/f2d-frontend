class ChatGroupRenderer {
    constructor(apiUrl, containerSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.init();
    }

    // Initialize the renderer
    init() {
        // Directly call renderChatGroups if document is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.renderChatGroups);
        } else {
            this.renderChatGroups();
        }
    }

    // Fetch chat group data from API
    async fetchChatGroupData() {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data.list; // Adjust this to match your API structure
        } catch (error) {
            console.error('Error fetching chat group data:', error);
            throw error;
        }
    }

    // Create an HTML element for a chat group
    createChatGroupItem(chatGroup) {
        const chatGroupItem = document.createElement('div');
        chatGroupItem.classList.add('chat-window');

        chatGroupItem.innerHTML = `
            <h3>${chatGroup.groupName}</h3>
        `;

        return chatGroupItem;
    }

    // Render chat groups into the container
    async renderChatGroups() {
        const chatGroupListContainer = document.querySelector(this.containerSelector);

        if (!chatGroupListContainer) {
            console.error(`Container with selector "${this.containerSelector}" not found.`);
            return;
        }

        try {
            const chatGroups = await this.fetchChatGroupData();
            chatGroups.forEach(chatGroup => {
                const chatGroupItem = this.createChatGroupItem(chatGroup);
                chatGroupListContainer.appendChild(chatGroupItem);
            });
        } catch (error) {
            console.log('Rendering error:', error);
            chatGroupListContainer.innerHTML = '<p>Failed to load chat groups. Please try again later.</p>';
        }
    }
}

// Create an instance of the class to render the groups
new ChatGroupRenderer('http://192.168.1.54:8083/chat-groups/all', '.chat-container');