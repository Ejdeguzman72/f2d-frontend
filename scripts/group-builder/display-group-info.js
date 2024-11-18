document.addEventListener("DOMContentLoaded", () => {
    const groupData = {
      groupId: "b475d545-c70e-4d20-8bf5-6993e7ce6ad1",
      groupName: "GREEN DOT CREW",
      groupType: "Friends",
      userIdSet: [],
      createTime: "2024-11-13",
      lastUpdateTime: "2024-11-13",
      chatGroup: {
        chatGroupId: "0658e09f-759f-45eb-8cd2-b3a82104b7f5",
        groupName: "GREEN DOT CREW",
        createDate: "2024-11-13",
        lastUpdateTime: "2024-11-13",
      },
    };
  
    function renderGroupDetails(group) {
      const container = document.getElementById("groupDetailsContainer");
  
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
          <div class="value">${group.userIdSet.length > 0 ? group.userIdSet.join(", ") : "No users yet"}</div>
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
    }
  
    // Render group details on page load
    renderGroupDetails(groupData);
  });
  