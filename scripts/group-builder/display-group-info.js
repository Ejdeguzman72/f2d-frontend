document.addEventListener("DOMContentLoaded", () => {
  let groupData = {};

  const retrieveGroupData = async (groupId) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const groupIdSearchParam = urlParams.get("groupId");
      const response = await axios.get(`http://192.168.1.54:8081/groups/search/id/${groupIdSearchParam}`);
      return response.data.f2dGroup;
    } catch (error) {
      console.error("Error retrieving group data:", error);
      return null;
    }
  };

  // Initialize rendering with a specific group ID
  retrieveGroupData().then((data) => {
    groupData = data;
    console.log('This is groupData: ', groupData)
    renderGroupDetails(groupData);
  });

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
