class EventListRenderer {
    constructor(apiUrl, containerSelector, paginationSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.paginationSelector = paginationSelector;
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.allEvents = [];
        this.init();
    }

    init = async () => {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.loadEventData();
            this.renderEvents();
        });
    };

    loadEventData = async () => {
        try {
            const response = await axios.get(this.apiUrl);
            this.allEvents = Array.isArray(response.data.list) ? response.data.list : [];
        } catch (error) {
            console.error('Error fetching event data: ', error);
            this.allEvents = [];
        }
    };

    renderEventItem = (eventDetails) => {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');

        eventItem.innerHTML = `
            <h3>${eventDetails.eventName}</h3>
            <p>Type: ${eventDetails.eventType}</p>
            <p>Description: ${eventDetails.description}</p>
            <p>Date: ${eventDetails.eventDate}</p>
            <p>Group: ${eventDetails.f2dGroup.groupName}</p>
            <button c>View Event</button>
            <button>Join Event</button>
        `;

        return eventItem;
    };

    renderEvents = () => {
        const eventListContainer = document.querySelector(this.containerSelector);
        const paginationContainer = document.querySelector(this.paginationSelector);

        eventListContainer.innerHTML = '';

        if (!Array.isArray(this.allEvents) || this.allEvents.length === 0) {
            eventListContainer.innerHTML = '<p>No events available.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        const totalItems = this.allEvents.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
        const currentEvents = this.allEvents.slice(startIndex, endIndex);

        currentEvents.forEach(event => {
            const eventItem = this.renderEventItem(event);
            eventListContainer.appendChild(eventItem);
        });

        this.renderPagination(totalPages);
    };

    renderPagination = (totalPages) => {
        const paginationContainer = document.querySelector(this.paginationSelector);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        // Create pagination button wrapper
        const paginationWrapper = document.createElement('div');
        paginationWrapper.classList.add('pagination-buttons'); // CSS class for grouping

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

        paginationContainer.appendChild(paginationWrapper); // Append as a single group
    };

    createPaginationButton = (label, isEnabled, onClick) => {
        const button = document.createElement('button');
        button.textContent = label;
        button.disabled = !isEnabled;
        button.classList.add('pagination-btn'); // Add styling class
        if (isEnabled) {
            button.addEventListener('click', onClick);
        }
        return button;
    };

    onPageClick = (page) => {
        this.currentPage = page;
        this.renderEvents();
    };
}

new EventListRenderer(
    'http://localhost:8082/events/all',
    '.event-list',
    '#pagination'
);
