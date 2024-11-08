class EventListRenderer {
    constructor(apiUrl, containerSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.init();
    }

    init = () => {
        document.addEventListener('DOMContentLoaded', this.renderEvents); // Corrected method name
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
        try {
            const events = await this.fetchEventData();
            console.log('this is events: ', events); // Use a comma for better formatting
            events.forEach(event => {
                const eventItem = this.renderEventItem(event); // Corrected method name
                eventListContainer.appendChild(eventItem);
            });
        } catch (error) {
            eventListContainer.innerHTML = '<p>Failed to load events. Please try again</p>';
        }
    }
}

// Create an instance of the class to render the events
new EventListRenderer('http://192.168.1.54:8082/events/all', '.event-list');