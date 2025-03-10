document.addEventListener("DOMContentLoaded", () => {
  let groupData = {};
  let groupMessageData = [];
  let groupEventData = [];
  let messagePage = 1;
  let eventPage = 1;
  const pageSize = 5; // Number of items per page
  const groupIdSearchParam = new URLSearchParams(window.location.search).get("groupId");

  // Show loading spinner
  const showLoading = () => {
    const loadingContainer = document.getElementById("loadingContainer");
    loadingContainer.style.display = "block"; // Show loading spinner
  };

  const hideLoading = () => {
    const loadingContainer = document.getElementById("loadingContainer");
    loadingContainer.style.display = "none"; // Hide loading spinner
  };

  // Fetch the group data from the backend
  const retrieveGroupData = async () => {
    try {
      const response = await axios.get(`http://192.168.1.54:8081/groups/search/id/${groupIdSearchParam}`);
      return response.data.f2dGroup;
    } catch (error) {
      console.error("Error retrieving group data:", error);
      return null;
    }
  };

  // Fetch the group messages from the backend
  const retrieveGroupMessageData = async () => {
    try {
      const response = await axios.get(`http://192.168.1.54:8081/group-message/all/search/group/${groupIdSearchParam}`);
      return response.data.list || [];
    } catch (error) {
      console.error("Error retrieving group message data:", error);
      return [];
    }
  };

  // Fetch the group events from the backend
  const retrieveGroupEvents = async () => {
    try {
      const response = await axios.get(`http://192.168.1.54:8082/events/all/search/group/${groupIdSearchParam}`);
      return response.data.list || [];
    } catch (error) {
      console.error("Error retrieving group event data:", error);
      return [];
    }
  };

  // Fetch and render the group data
  retrieveGroupData().then((data) => {
    groupData = data;
    renderGroupDetails(groupData);
    hideLoading();
  });

  // Fetch and render the group message data
  retrieveGroupMessageData().then((data) => {
    groupMessageData = data;
    renderGroupMessageData();
    hideLoading();
  });

  // Fetch and render the group events data
  retrieveGroupEvents().then((data) => {
    groupEventData = data;
    renderGroupEventsDetails();
    hideLoading();
  });

  // Pagination function to manage data splitting
  const paginate = (data, page) => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  };

  // Render the group message data with pagination
  const renderGroupMessageData = () => {
    const container = document.getElementById("groupMessagesContainer");
    container.innerHTML = "";
    if (!groupMessageData.length) {
      container.innerHTML = '<div class="error">No group messages available.</div>';
      return;
    }

    paginate(groupMessageData, messagePage).forEach((message) => {
      const messageCard = document.createElement("div");
      messageCard.className = "message-card";
      messageCard.innerHTML = `
        <div class="header">Group Message</div>
        <div><strong>Title:</strong> ${message.title}</div>
        <div><strong>Content:</strong> ${message.content}</div>
      `;
      container.appendChild(messageCard);
    });

    renderPaginationControls("groupMessagesPagination", messagePage, Math.ceil(groupMessageData.length / pageSize), (page) => {
      messagePage = page;
      renderGroupMessageData();
    });
  };

  // Render the group event details with pagination
  const renderGroupEventsDetails = () => {
    const container = document.getElementById("groupEventsContainer");
    container.innerHTML = "";
    if (!groupEventData.length) {
      container.innerHTML = '<div class="error">No group events available.</div>';
      return;
    }

    paginate(groupEventData, eventPage).forEach((groupEvent) => {
      const eventCard = document.createElement("div");
      eventCard.className = "event-card";
      eventCard.innerHTML = `
        <div class="header">Event Details</div>
        <div><strong>Event Name:</strong> ${groupEvent.eventName}</div>
        <div><strong>Event Type:</strong> ${groupEvent.eventType}</div>
        <div><strong>Description:</strong> ${groupEvent.description}</div>
        <div><strong>Event Date:</strong> ${groupEvent.eventDate}</div>
      `;
      container.appendChild(eventCard);
    });

    renderPaginationControls("groupEventsPagination", eventPage, Math.ceil(groupEventData.length / pageSize), (page) => {
      eventPage = page;
      renderGroupEventsDetails();
    });
  };

  // Render pagination controls
  const renderPaginationControls = (containerId, currentPage, totalPages, onPageChange) => {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (totalPages <= 1) return;

    const prevButton = document.createElement("button");
    prevButton.innerText = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => onPageChange(currentPage - 1));
    container.appendChild(prevButton);

    const pageInfo = document.createElement("span");
    pageInfo.innerText = ` Page ${currentPage} of ${totalPages} `;
    container.appendChild(pageInfo);

    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => onPageChange(currentPage + 1));
    container.appendChild(nextButton);
  };

  // Render the group details
  const renderGroupDetails = (group) => {
    const container = document.getElementById("groupDetailsContainer");

    if (!container) {
      console.error("Group details container not found");
      return;
    }

    if (!group) {
      container.innerHTML = `<div class="error">Failed to load group details.</div>`;
      return;
    }

    console.log("Rendering group details:", group);  // Log the group data for debugging

    container.innerHTML = `
      <div class="header">Group Details</div>
      <div><strong>Group ID:</strong> ${group.groupId}</div>
      <div><strong>Group Name:</strong> ${group.groupName}</div>
      <div><strong>Group Type:</strong> ${group.groupType}</div>
      <div><strong>Users in Group:</strong> ${group.userIdSet?.length ? group.userIdSet.join(", ") : "No users yet"}</div>
      <div><strong>Created On:</strong> ${group.createTime}</div>
      <div><strong>Last Updated:</strong> ${group.lastUpdateTime}</div>
    `;
  };
});
