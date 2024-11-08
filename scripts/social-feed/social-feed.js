class SocialFeedRenderer {
    constructor(apiUrl, containerSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.init();
    }

    init = () => {
        document.addEventListener('DOMContentLoaded', this.renderSocialFeed);
    }

    fetchSocialFeedData = async () => {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data.list; // Ensure this matches your API response structure
        } catch (error) {
            console.error('Error fetching event data: ', error);
            throw error;
        }
    }

    renderSocialFeedItem = (message) => {
        const messageItem = document.createElement('div'); // Create a new div
        messageItem.classList.add('post');

        messageItem.innerHTML = `
            <h3>${message.content}</h3>
        `;

        return messageItem;
    }

    renderSocialFeed = async () => {
        const socialFeedListContainer = document.querySelector(this.containerSelector);
        try {
            const socialFeedItems = await this.fetchSocialFeedData();
            console.log('This is social feed data:', socialFeedItems);
            socialFeedItems.forEach(item => {
                const socialFeedMessage = this.renderSocialFeedItem(item);
                socialFeedListContainer.appendChild(socialFeedMessage);
            });
        } catch (error) {
            socialFeedListContainer.innerHTML = '<p>Failed to load social feed. Please try again.</p>';
        }
    }
}

// Create an instance of the class to render the events
new SocialFeedRenderer('http://192.168.1.54:8081/group-message/all', '.blog-posts');
