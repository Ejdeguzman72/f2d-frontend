class EventListRenderer {
    constructor(apiUrl, containerSelector, paginationSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.paginationSelector = paginationSelector;
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.allEvents = [];
        this.token = localStorage.getItem('F2DToken');
        this.init();
    }

    init = async () => {
        console.log('Initializing EventListRenderer...');
        let userId = await this.loadLoggedInUserData();
        console.log('This is userId ' + userId);
        await this.loadEventData();
        this.renderEvents(userId);
    };

    loadLoggedInUserData = async () => {
        if (!this.token) {
            console.log('Token not found in local storage');
            alert('Please log into F2D');
            return null;
        }

        try {
            console.log("Decoding JWT token...");
            const decoded = jwt_decode(this.token);
            let username = decoded.sub;

            if (decoded.exp * 1000 < Date.now()) {
                alert('Session expired. Please log in again.');
                console.log("Token has expired.");
                return null;
            }

            console.log("Token is valid. Fetching user details...");
            const response = await fetch(`http://192.168.1.54:8080/users/search/username/${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                let userInfo = await response.json();
                return userInfo.user.userId;
            }
        } catch (error) {
            console.error('Failed to decode JWT token:', error);
            alert('Invalid session. Please log in again.');
            return null;
        }
    };

    loadEventData = async () => {
        try {
            const response = await axios.get(this.apiUrl, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });

            this.allEvents = Array.isArray(response.data.list) ? response.data.list : [];
        } catch (error) {
            console.error('Error fetching event data: ', error);
            this.allEvents = [];
        }
    };

    createEventItem = (eventDetails, currentUserId) => {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');
        console.log(eventDetails);

        // Ensure attendees is an array, even if empty or undefined
        const attendees = Array.isArray(eventDetails.attendees) ? eventDetails.attendees : [];

        // Check if the current user is in the attendees list
        const isParticipant = attendees.includes(currentUserId);
        console.log(isParticipant)

        eventItem.innerHTML = `
            <h3>${eventDetails.eventName}</h3>
            <p>Type: ${eventDetails.eventType}</p>
            <p>Description: ${eventDetails.description}</p>
            <p>Date: ${eventDetails.eventDate}</p>
            <p>Group: ${eventDetails.f2dGroup.groupName}</p>
            <button><a href="event-info-page.html?eventId=${eventDetails.eventId}" class="btn">View Event</a></button>
            <button class="btn" id="event-btn-${eventDetails.eventId}">${isParticipant ? 'Leave Event' : 'Join Event'}</button>
        `;

        const eventButton = eventItem.querySelector(`#event-btn-${eventDetails.eventId}`);

        eventButton.addEventListener('click', async () => {
            if (eventButton.textContent === "Join Event") {
                await this.updateEventParticipation(eventDetails, currentUserId, "add");
                eventButton.textContent = "Leave Event";
            } else {
                await this.updateEventParticipation(eventDetails, currentUserId, "remove");
                eventButton.textContent = "Join Event";
            }

            // Optionally, reload the event list or update the UI after the action
        });

        return eventItem;
    };

    updateEventParticipation = async (eventDetails, currentUserId, action) => {
        console.log(`${action === "add" ? "Joining" : "Leaving"} event - ${eventDetails.eventName}`);

        try {
            // Ensure attendees is an array, even if empty or undefined
            const attendees = Array.isArray(eventDetails.attendees) ? eventDetails.attendees : [];

            const updatedParticipants = action === "add"
                ? [...attendees, currentUserId]
                : attendees.filter(id => id !== currentUserId);

            const requestBody = {
                eventId: eventDetails.eventId,
                eventName: eventDetails.eventName,
                eventType: eventDetails.eventType,
                description: eventDetails.description,
                eventDate: eventDetails.eventDate,
                f2dGroup: eventDetails.f2dGroup,
                attendees: updatedParticipants
            };

            
            const response = await fetch(`http://192.168.1.54:8082/events/update/${eventDetails.eventId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                console.log(`User ${currentUserId} successfully ${action === "add" ? "joined" : "left"} event ${eventDetails.eventName}`);
            } else {
                console.error(`Failed to ${action === "add" ? "join" : "leave"} event:`, await response.text());
            }
        } catch (error) {
            console.error(`Error ${action === "add" ? "joining" : "leaving"} event:`, error);
        }
    };

    renderEvents = (userId) => {
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
            const eventItem = this.createEventItem(event, userId);
            eventListContainer.appendChild(eventItem);
        });

        this.renderPagination(totalPages, userId);
    };

    renderPagination = (totalPages, userId) => {
        const paginationContainer = document.querySelector(this.paginationSelector);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        const paginationWrapper = document.createElement('div');
        paginationWrapper.classList.add('pagination-buttons');

        const prevButton = this.createPaginationButton('Prev', this.currentPage > 1, () => this.onPageClick(this.currentPage - 1, userId));
        paginationWrapper.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const button = this.createPaginationButton(i, true, () => this.onPageClick(i, userId));
            if (i === this.currentPage) {
                button.classList.add('active');
            }
            paginationWrapper.appendChild(button);
        }

        const nextButton = this.createPaginationButton('Next', this.currentPage < totalPages, () => this.onPageClick(this.currentPage + 1, userId));
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

    onPageClick = (page, userId) => {
        this.currentPage = page;
        this.renderEvents(userId);
    };
}

new EventListRenderer(
    'http://192.168.1.54:8082/events/all',
    '.event-list',
    '#pagination'
);
