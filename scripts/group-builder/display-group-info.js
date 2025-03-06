document.addEventListener("DOMContentLoaded", () => {
  let groupData = {};
  let groupMessageData = [];
  let groupEventData = [];
  let messagePage = 1;
  let eventPage = 1;
  const pageSize = 5; // Number of items per page
  const groupIdSearchParam = new URLSearchParams(window.location.search).get("groupId");

  const retrieveGroupData = async () => {
    try {
      const response = await axios.get(`http://192.168.1.54:8081/groups/search/id/${groupIdSearchParam}`);
      return response.data.f2dGroup;
    } catch (error) {
      console.error("Error retrieving group data:", error);
      return null;
    }
  };

  const retrieveGroupMessageData = async () => {
    try {
      const response = await axios.get(`http://192.168.1.54:8081/group-message/all/search/group/${groupIdSearchParam}`);
      return response.data.list || [];
    } catch (error) {
      console.error("Error retrieving group message data:", error);
      return [];
    }
  };

  const retrieveGroupEvents = async () => {
    try {
      const response = await axios.get(`http://192.168.1.54:8082/events/all/search/group/${groupIdSearchParam}`);
      return response.data.list || [];
    } catch (error) {
      console.error("Error retrieving group event data:", error);
      return [];
    }
  };

  retrieveGroupData().then((data) => {
    groupData = data;
    renderGroupDetails(groupData);
  });

  retrieveGroupMessageData().then((data) => {
    groupMessageData = data;
    renderGroupMessageData();
  });

  retrieveGroupEvents().then((data) => {
    groupEventData = data;
    renderGroupEventsDetails();
  });

  const paginate = (data, page) => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  };

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

  const renderGroupDetails = (group) => {
    const container = document.getElementById("groupDetailsContainer");
    if (!group) {
      container.innerHTML = `<div class="error">Failed to load group details.</div>`;
      return;
    }
    container.innerHTML = `
      <div class="header">Group Details</div>
      <div><strong>Group ID:</strong> ${group.groupId}</div>
      <div><strong>Group Name:</strong> ${group.groupName}</div>
      <div><strong>Group Type:</strong> ${group.groupType}</div>
      <div><strong>Users in Group:</strong> ${group.userIdSet?.length ? group.userIdSet.join(", ") : "No users yet"}</div>
      <div><strong>Created On:</strong> ${group.createTime}</div>
      <div><strong>Last Updated:</strong> ${group.lastUpdateTime}</div>
      <br>
      <div class="header">Chat Group Details</div>
      <div><strong>Chat Group ID:</strong> ${group.chatGroup.chatGroupId}</div>
      <div><strong>Chat Group Name:</strong> ${group.chatGroup.groupName}</div>
      <div><strong>Created On:</strong> ${group.chatGroup.createDate}</div>
      <div><strong>Last Updated:</strong> ${group.chatGroup.lastUpdateTime}</div>
    `;
  };
});
