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
    };

    fetchSocialFeedData = async () => {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data.list || []; // Ensure it's always an array
        } catch (error) {
            console.error('Error fetching social feed data:', error);
            return [];
        }
    };

    renderSocialFeedItem = (message) => {
        const messageItem = document.createElement('div');
        messageItem.classList.add('post');
        messageItem.innerHTML = `
            <h2>${message.title}</h2>
            <p>${message.content}</p>
        `;
        return messageItem;
    };

    renderSocialFeed = async () => {
        const socialFeedListContainer = document.querySelector(this.containerSelector);
        const paginationContainer = document.querySelector(this.paginationSelector);
        socialFeedListContainer.innerHTML = '';

        try {
            const allItems = await this.fetchSocialFeedData();

            if (!allItems.length) {
                socialFeedListContainer.innerHTML = '<p>No posts available.</p>';
                paginationContainer.innerHTML = '';
                return;
            }

            const totalItems = allItems.length;
            const totalPages = Math.ceil(totalItems / this.itemsPerPage);
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
            const currentItems = allItems.slice(startIndex, endIndex);

            currentItems.forEach(item => {
                const socialFeedMessage = this.renderSocialFeedItem(item);
                socialFeedListContainer.appendChild(socialFeedMessage);
            });

            this.renderPagination(totalPages);
        } catch (error) {
            socialFeedListContainer.innerHTML = '<p>Failed to load social feed. Please try again.</p>';
        }
    };

    renderPagination = (totalPages) => {
        const paginationContainer = document.querySelector(this.paginationSelector);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        const paginationWrapper = document.createElement('div');
        paginationWrapper.classList.add('pagination-buttons');

        const prevButton = this.createPaginationButton('Prev', this.currentPage > 1, () => this.onPageClick(this.currentPage - 1));
        paginationWrapper.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const button = this.createPaginationButton(i, true, () => this.onPageClick(i));
            if (i === this.currentPage) {
                button.classList.add('active');
            }
            paginationWrapper.appendChild(button);
        }

        const nextButton = this.createPaginationButton('Next', this.currentPage < totalPages, () => this.onPageClick(this.currentPage + 1));
        paginationWrapper.appendChild(nextButton);

        paginationContainer.appendChild(paginationWrapper);
    };

    createPaginationButton = (label, isEnabled, onClick) => {
        const button = document.createElement('button');
        button.textContent = label;
        button.disabled = !isEnabled;
        button.classList.add('pagination-btn');
        if (isEnabled) {
            button.addEventListener('click', onClick);
        }
        return button;
    };

    onPageClick = (page) => {
        this.currentPage = page;
        this.renderSocialFeed();
    };
}

// Create an instance of SocialFeedRenderer
new SocialFeedRenderer(
    'http://192.168.1.54:8081/group-message/all',
    '.blog-posts',
    '#pagination'
);
