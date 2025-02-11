document.addEventListener("DOMContentLoaded", () => {
  let groupData = {};
  let groupMessageData = [];
  let groupEventData = [];
  const groupIdSearchParam = new URLSearchParams(window.location.search).get("groupId");

  const retrieveGroupData = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/groups/search/id/${groupIdSearchParam}`);
      return response.data.f2dGroup;
    } catch (error) {
      console.error("Error retrieving group data:", error);
      return null;
    }
  };

  const retrieveGroupMessageData = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/group-message/all/search/group/${groupIdSearchParam}`);
      return response.data.list;
    } catch (error) {
      console.error('Error retrieving group message data:', error);
      return null;
    }
  };

  const retrieveGroupEvents = async () => {
    try {
      const response = await axios.get(`http://localhost:8082/events/all/search/group/${groupIdSearchParam}`);
      return response.data.list;
    } catch (error) {
      console.error('Error retrieving group event data:', error);
      return null;
    }
  };

  // Initialize rendering with a specific group ID
  retrieveGroupData().then((data) => {
    groupData = data;
    console.log('This is groupData:', groupData);
    renderGroupDetails(groupData);
  });

  retrieveGroupMessageData().then((data) => {
    groupMessageData = data
    console.log('This is group message data:', groupMessageData);
    renderGroupMessageData(groupMessageData);
  });

  retrieveGroupEvents().then((data) => {
    groupEventData = data;
    console.log('This is group event data:', groupEventData);
    renderGroupEventsDetails(groupEventData);
  });

  const renderGroupMessageData = (messages) => {
    const container = document.getElementById('groupMessagesContainer')
    container.innerHTML = '';
    if (!messages || messages.length === 0) {
      container.innerHTML = '<div class="error">Failed to load group messages.</div>';
      return;
    }

    messages.forEach(message => {
      console.log('this is message: ', message)
      const messageCard = document.createElement('div');
      messageCard.className = 'message-card';

      messageCard.innerHTML = `
        <div class="header">Group Messages</div>
      <div>
        <span class="label">Message Title:</span>
        <div class="value">${message.title}</div>
      </div>
      <div>
        <span class="label">Message Content:</span>
        <div class="value">${message.content}</div>
      </div>
      `;
    })
  }

  const renderGroupEventsDetails = (eventDetails) => {
    const container = document.getElementById('groupEventsContainer');

    // Clear existing content
    container.innerHTML = '';

    if (!eventDetails || eventDetails.length === 0) {
      container.innerHTML = '<div class="error">Failed to load group event details.</div>';
      return;
    }

    eventDetails.forEach(groupEvent => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';

      eventCard.innerHTML = `
        <div class="header">Event Details</div>
      <div>
        <span class="label">Event Name:</span>
        <div class="value">${groupEvent.eventName}</div>
      </div>
      <div>
        <span class="label">Event Type:</span>
        <div class="value">${groupEvent.eventType}</div>
      </div>
      <div>
        <span class="label">Description:</span>
        <div class="value">${groupEvent.description}</div>
      </div>
      <div>
        <span class="label">Event Date:</span>
        <div class="value">${groupEvent.eventDate}</div>
      </div>
      `;

      container.appendChild(eventCard);
    });
  };

  const renderGroupDetails = (group) => {
    const container = document.getElementById("groupDetailsContainer");
    if (!group) {
      container.innerHTML = `<div class="error">Failed to load group details.</div>`;
      return;
    }
    container.innerHTML = `
      <div class="header">Group Details</div>
      <div>
        <span class="label">Group ID:</span>
        <div class="value">${group.groupId}</div>
      </div>
      <div>
        <span class="label">Group Name:</span>
        <div class="value">${group.groupName}</div>
      </div>
      <div>
        <span class="label">Group Type:</span>
        <div class="value">${group.groupType}</div>
      </div>
      <div>
        <span class="label">Users in Group:</span>
        <div class="value">${group.userIdSet && group.userIdSet.length > 0 ? group.userIdSet.join(", ") : "No users yet"}</div>
      </div>
      <div>
        <span class="label">Created On:</span>
        <div class="value">${group.createTime}</div>
      </div>
      <div>
        <span class="label">Last Updated:</span>
        <div class="value">${group.lastUpdateTime}</div>
      </div><br>
      <div class="header">Chat Group Details</div>
      <div>
        <span class="label">Chat Group ID:</span>
        <div class="value">${group.chatGroup.chatGroupId}</div>
      </div>
      <div>
        <span class="label">Chat Group Name:</span>
        <div class="value">${group.chatGroup.groupName}</div>
      </div>
      <div>
        <span class="label">Created On:</span>
        <div class="value">${group.chatGroup.createDate}</div>
      </div>
      <div>
        <span class="label">Last Updated:</span>
        <div class="value">${group.chatGroup.lastUpdateTime}</div>
      </div>
    `;
  };
});
