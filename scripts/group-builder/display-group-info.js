document.addEventListener("DOMContentLoaded", async () => {
  let groupData = {};
  let groupMessageData = [];
  let groupEventData = [];
  let messagePage = 1;
  let eventPage = 1;
  const pageSize = 5;
  const groupIdSearchParam = new URLSearchParams(window.location.search).get("groupId");

  const showLoading = () => document.getElementById("loadingContainer").style.display = "block";
  const hideLoading = () => document.getElementById("loadingContainer").style.display = "none";

  // Fetch functions
  const fetchData = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data.list || response.data.f2dGroup || [];
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return [];
    }
  };

  // Fetch and store data
  const retrieveGroupData = async () => fetchData(`http://192.168.1.54:8081/groups/search/id/${groupIdSearchParam}`);
  const retrieveGroupMessageData = async () => fetchData(`http://192.168.1.54:8081/group-message/all/search/group/${groupIdSearchParam}`);
  const retrieveGroupEvents = async () => fetchData(`http://192.168.1.54:8082/events/all/search/group/${groupIdSearchParam}`);

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

  const renderGroupDetails = (group) => {
    const container = document.getElementById("groupDetailsContainer");
    if (!container) return console.error("Group details container not found");
    container.innerHTML = group
      ? `<div class="header">Group Details</div>
         <div><strong>Group ID:</strong> ${group.groupId}</div>
         <div><strong>Group Name:</strong> ${group.groupName}</div>
         <div><strong>Group Type:</strong> ${group.groupType}</div>
         <div><strong>Created On:</strong> ${group.createTime}</div>
         <div><strong>Last Updated:</strong> ${group.lastUpdateTime}</div>`
      : `<div class="error">Failed to load group details.</div>`;
  };

  const renderListData = (containerId, data, renderItem, noDataMessage) => {
    const container = document.getElementById(containerId);
    container.innerHTML = data.length
      ? data.map(renderItem).join("")
      : `<div class="error">${noDataMessage}</div>`;
  };

  const renderGroupMessageData = () => {
    renderListData("groupMessagesContainer", paginate(groupMessageData, messagePage),
      (msg) => `<div class="message-card">
                  <div class="header">Group Message</div>
                  <div><strong>Title:</strong> ${msg.title}</div>
                  <div><strong>Content:</strong> ${msg.content}</div>
                </div>`,
      "No group messages available."
    );
    renderPaginationControls("groupMessagesPagination", messagePage, Math.ceil(groupMessageData.length / pageSize),
      (page) => { messagePage = page; renderGroupMessageData(); });
  };

  const renderGroupEventsDetails = () => {
    renderListData("groupEventsContainer", paginate(groupEventData, eventPage),
      (event) => `<div class="event-card">
                    <div class="header">Event Details</div>
                    <div><strong>Event Name:</strong> ${event.eventName}</div>
                    <div><strong>Event Type:</strong> ${event.eventType}</div>
                    <div><strong>Description:</strong> ${event.description}</div>
                    <div><strong>Event Date:</strong> ${event.eventDate}</div>
                  </div>`,
      "No group events available."
    );
    renderPaginationControls("groupEventsPagination", eventPage, Math.ceil(groupEventData.length / pageSize),
      (page) => { eventPage = page; renderGroupEventsDetails(); });
  };

  const renderUsersInGroup = async (group) => {
    const container = document.getElementById("groupUsersContainer");
    container.innerHTML = `<div class="header">Group Users</div>`;

    if (!group || !group.userIdSet || group.userIdSet.length === 0) {
      container.innerHTML = `<div class="error">No users in group.</div>`;
      return;
    }

    const userList = document.createElement("ul");
    const token = localStorage.getItem("F2DToken");

    await Promise.all(group.userIdSet.map(async (userId) => {
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
        // console.log(user.user.username)
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
    [groupData, groupMessageData, groupEventData] = await Promise.all([
      retrieveGroupData(),
      retrieveGroupMessageData(),
      retrieveGroupEvents()
    ]);

    renderGroupDetails(groupData);
    renderUsersInGroup(groupData);
    renderGroupMessageData();
    renderGroupEventsDetails();
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    hideLoading();
  }
});
