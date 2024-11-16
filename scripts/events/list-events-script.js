class EventListRenderer {
    constructor(apiUrl, containerSelector, paginationSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.paginationSelector = paginationSelector;
        this.currentPage = 1;
        this.itemsPerPage = 4; // Adjust as needed
        this.init();
    }

    init = () => {
        document.addEventListener('DOMContentLoaded', this.renderEvents);
    }

    fetchEventData = async () => {
        try {
            const response = await axios.get(this.apiUrl);
            return response.data.list;
        } catch (error) {
            console.error('Error fetching event data: ', error);
            throw error;
        }
    }

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
    }

    renderEvents = async () => {
        const eventListContainer = document.querySelector(this.containerSelector);
        const paginationContainer = document.querySelector(this.paginationSelector);
        eventListContainer.innerHTML = ''; // Clear previous content
        try {
            const allEvents = await this.fetchEventData();

            // Pagination logic
            const totalItems = allEvents.length;
            const totalPages = Math.ceil(totalItems / this.itemsPerPage);
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;

            const currentEvents = allEvents.slice(startIndex, endIndex);

            currentEvents.forEach(event => {
                const eventItem = this.renderEventItem(event);
                eventListContainer.appendChild(eventItem);
            });

            this.renderPagination(totalPages);
        } catch (error) {
            console.error(error);
            eventListContainer.innerHTML = '<p>Failed to load events. Please try again.</p>';
        }
    }

    renderPagination = (totalPages) => {
        const paginationContainer = document.querySelector(this.paginationSelector);
        paginationContainer.innerHTML = ''; // Clear previous pagination buttons
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
        this.renderEvents();
    }
}

// Create an instance of the class to render the events with pagination
new EventListRenderer(
    'http://192.168.1.54:8082/events/all',
    '.event-list',
    '#pagination'
);
