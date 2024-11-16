class SocialFeedRenderer {
    constructor(apiUrl, containerSelector, paginationSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.paginationSelector = paginationSelector;
        this.currentPage = 1;
        this.itemsPerPage = 5;
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
            console.error('Error fetching social feed data:', error);
            throw error;
        }
    }

    renderSocialFeedItem = (message) => {
        const messageItem = document.createElement('div');
        messageItem.classList.add('post');
        messageItem.innerHTML = `
            <h2>${message.title}</h2>
            <p>${message.content}</p>
        `;
        return messageItem;
    }

    renderSocialFeed = async () => {
        const socialFeedListContainer = document.querySelector(this.containerSelector);
        const paginationContainer = document.querySelector(this.paginationSelector);
        socialFeedListContainer.innerHTML = '';
        try {
            const allItems = await this.fetchSocialFeedData();

            // Pagination logic
            const totalItems = allItems.length;
            const totalPages = Math.ceil(totalItems / this.itemsPerPage);
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;

            const currentItems = allItems.slice(startIndex, endIndex);

            currentItems.forEach(item => {
                const socialFeedMessage = this.renderSocialFeedItem(item);
                socialFeedListContainer.appendChild(socialFeedMessage);
            });

            this.renderPagination(totalPages);
        } catch (error) {
            socialFeedListContainer.innerHTML = '<p>Failed to load social feed. Please try again.</p>';
        }
    }

    renderPagination = (totalPages) => {
        const paginationContainer = document.querySelector(this.paginationSelector);
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.classList.add('pagination-button');
            if (i === this.currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => this.onPageClick(i));
            paginationContainer.appendChild(button);
        }
    }

    onPageClick = (page) => {
        this.currentPage = page;
        this.renderSocialFeed();
    }
}

// Create an instance of the SocialFeedRenderer
new SocialFeedRenderer(
    'http://192.168.1.54:8081/group-message/all',
    '.blog-posts',
    '#pagination'
);
