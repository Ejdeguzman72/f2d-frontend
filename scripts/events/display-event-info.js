document.addEventListener("DOMContentLoaded", async () => {
  let eventData = {};
  let eventPage = 1;
  const pageSize = 5;
  const eventIdSearchParam = new URLSearchParams(window.location.search).get("eventId");

  const showLoading = () => document.getElementById("loadingContainer").style.display = "block";
  const hideLoading = () => document.getElementById("loadingContainer").style.display = "none";

  // Fetch functions
  const fetchData = async (uri) => {
      try {
          const response = await axios.get(uri);
          console.log(response);
          return response.data.list || response.data.event || [];
      } catch (error) {
          console.error(`Error fetching data from ${uri}:`, error);
          return [];
      }
  };

  const retrieveEventData = async () => fetchData(`http://192.168.1.54:8082/events/search/id/${eventIdSearchParam}`);

  const paginate = (data, page) => data.slice((page - 1) * pageSize, page * pageSize);

  const renderPaginationControls = (containerId, currentPage, totalPages, onPageChange) => {
      const container = document.getElementById(containerId);
      container.innerHTML = "";

      if (totalPages <= 1) return;

      const createButton = (text, disabled, onClick) => {
          const button = document.createElement("button");
          button.innerText = text;
          button.disabled = disabled;
          button.addEventListener("click", onClick);
          return button;
      };

      container.appendChild(createButton("Previous", currentPage === 1, () => onPageChange(currentPage - 1)));
      container.appendChild(document.createTextNode(` Page ${currentPage} of ${totalPages} `));
      container.appendChild(createButton("Next", currentPage === totalPages, () => onPageChange(currentPage + 1)));
  };

  const renderEventDetails = (event) => {
      const container = document.getElementById("eventDetailsContainer");
      if (!container) return console.error("Event details container not found");

      container.innerHTML = event
          ? `<div class="header">Event Details</div>
             <div><strong>Event ID:</strong> ${event.eventId}</div>
             <div><strong>Event Name:</strong> ${event.eventName}</div>
             <div><strong>Event Type:</strong> ${event.eventType}</div>
             <div><strong>Description:</strong> ${event.description}</div>`
          : `<div class="error">Failed to load event details.</div>`;
  };

  const renderUsersInEvent = async (event) => {
      const container = document.getElementById("eventUsersContainer");
      container.innerHTML = `<div class="header">Event Users</div>`;

      if (!event || !event.attendees || event.attendees.length === 0) {
          container.innerHTML = `<div class="error">No users in this event.</div>`;
          return;
      }

      const userList = document.createElement("ul");
      const token = localStorage.getItem("F2DToken");

      await Promise.all(event.attendees.map(async (userId) => {
          const listItem = document.createElement("li");

          try {
              const response = await fetch(`http://192.168.1.54:8080/users/search/id/${userId}`, {
                  method: "GET",
                  headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json"
                  }
              });

              if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

              const user = await response.json();
              listItem.textContent = `${user.user.username} (ID: ${userId})`;
          } catch (error) {
              console.error(`Error fetching user data for ID ${userId}:`, error);
              listItem.textContent = `User ID: ${userId} (Failed to fetch details)`;
          }

          userList.appendChild(listItem);
      }));

      container.appendChild(userList);
  };

  // Load and render all data
  showLoading();
  try {
      eventData = await retrieveEventData();
      renderEventDetails(eventData);
      await renderUsersInEvent(eventData);
  } catch (error) {
      console.error("Error loading data:", error);
  } finally {
      hideLoading();
  }
});
