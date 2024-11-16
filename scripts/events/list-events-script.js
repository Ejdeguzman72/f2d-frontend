class EventListRenderer {
    constructor(apiUrl, containerSelector, paginationSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.paginationSelector = paginationSelector;
        this.currentPage = 1;
        this.itemsPerPage = 5; // Number of events per page
        this.allEvents = []; // Store all events
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
            this.allEvents = response.data.list;
        } catch (error) {
            console.error('Error fetching event data: ', error);
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
        `;

        return eventItem;
    };

    renderEvents = () => {
        const eventListContainer = document.querySelector(this.containerSelector);
        const paginationContainer = document.querySelector(this.paginationSelector);

        eventListContainer.innerHTML = ''; // Clear previous content

        if (!this.allEvents.length) {
            eventListContainer.innerHTML = '<p>No events available.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        const totalItems = this.allEvents.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        // Calculate the range of events to display for the current page
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
        const currentEvents = this.allEvents.slice(startIndex, endIndex);

        currentEvents.forEach(event => {
            const eventItem = this.renderEventItem(event);
            eventListContainer.appendChild(eventItem);
        });

        // Render pagination buttons
        this.renderPagination(totalPages);
    };

    renderPagination = (totalPages) => {
        const paginationContainer = document.querySelector(this.paginationSelector);
        paginationContainer.innerHTML = ''; // Clear previous buttons

        const maxVisiblePages = 5; // Limit visible page buttons
        const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust the start page for edge cases
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // "First" Button
        const firstButton = this.createPaginationButton('First', this.currentPage > 1, () => this.onPageClick(1));
        paginationContainer.appendChild(firstButton);

        // "Previous" Button
        const prevButton = this.createPaginationButton('Prev', this.currentPage > 1, () => this.onPageClick(this.currentPage - 1));
        paginationContainer.appendChild(prevButton);

        // Numeric Buttons
        for (let i = startPage; i <= endPage; i++) {
            const button = this.createPaginationButton(i, true, () => this.onPageClick(i));
            if (i === this.currentPage) {
                button.classList.add('active'); // Highlight active page
            }
            paginationContainer.appendChild(button);
        }

        // "Next" Button
        const nextButton = this.createPaginationButton('Next', this.currentPage < totalPages, () => this.onPageClick(this.currentPage + 1));
        paginationContainer.appendChild(nextButton);

        // "Last" Button
        const lastButton = this.createPaginationButton('Last', this.currentPage < totalPages, () => this.onPageClick(totalPages));
        paginationContainer.appendChild(lastButton);
    };

    createPaginationButton = (label, isEnabled, onClick) => {
        const button = document.createElement('button');
        button.textContent = label;
        button.disabled = !isEnabled;
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

// Create an instance of the class to render the events
new EventListRenderer(
    'http://192.168.1.54:8082/events/all',
    '.event-list',
    '#pagination'
);
