class GroupRenderer {
    constructor(apiUrl, containerSelector, paginationSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.paginationSelector = paginationSelector;
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.allGroups = [];
        this.token = localStorage.getItem('F2DToken');
        this.init();
    }

    init = async () => {
        console.log('Initializing GroupRenderer...');
        let userId = await this.loadLoggedInUserData();
        console.log('This is userId ' + userId);
        await this.loadGroupData();
        this.renderGroups(userId);
    };

    loadLoggedInUserData = async () => {
        console.log('starting...');
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
            const response = await fetch(`http://localhost:8080/users/search/username/${username}`, {
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

    loadGroupData = async () => {
        if (!this.token) {
            console.error("User is not authenticated.");
            return;
        }

        try {
            const response = await axios.get(this.apiUrl, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });

            this.allGroups = response.data.list || [];
            console.log('Groups loaded:', this.allGroups);
        } catch (error) {
            console.error('Error fetching group data:', error);
            this.allGroups = [];
        }
    };

    createGroupItem = (group, currentUserId) => {
        const groupItem = document.createElement('div');
        groupItem.classList.add('group-item');

        const isMember = group.userIdSet.includes(currentUserId);

        groupItem.innerHTML = `
            <h3>${group.groupName}</h3>
            <p>Type: ${group.groupType}</p>
            <p>Members: ${group.userIdSet.length}</p>
            <button><a href="group-info-page.html?groupId=${group.groupId}" class="btn">View Group</a></button>
            <button id="group-btn-${group.groupId}">${isMember ? 'Leave Group' : 'Join Group'}</button>
        `;

        const groupButton = groupItem.querySelector(`#group-btn-${group.groupId}`);

        groupButton.addEventListener('click', async () => {
            if (groupButton.textContent === "Join Group") {
                await this.updateGroupMembership(group, currentUserId, "add");
                groupButton.textContent = "Leave Group"; 
            } else {
                await this.updateGroupMembership(group, currentUserId, "remove");
                groupButton.textContent = "Join Group"; 
            }

            window.location.reload();
        });

        return groupItem;
    };

    updateGroupMembership = async (group, currentUserId, action) => {
        console.log(`${action === "add" ? "Adding" : "Removing"} user - ${currentUserId} ${action === "add" ? "to" : "from"} group - ${group.groupName}`);

        try {
            const updatedUserIdSet = action === "add"
                ? [...group.userIdSet, currentUserId]
                : group.userIdSet.filter(id => id !== currentUserId);

            const requestBody = {
                groupId: group.groupId,
                groupName: group.groupName,
                groupType: group.groupType,
                userIdSet: updatedUserIdSet
            };

            const response = await fetch(`http://localhost:8081/groups/update/${group.groupId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                console.log(`User ${currentUserId} successfully ${action === "add" ? "joined" : "left"} group ${group.groupName}`);
            } else {
                console.error(`Failed to ${action === "add" ? "join" : "leave"} group:`, await response.text());
            }
        } catch (error) {
            console.error(`Error ${action === "add" ? "joining" : "leaving"} group:`, error);
        }
    };

    renderGroups = (userId) => {
        const groupListContainer = document.querySelector(this.containerSelector);
        const paginationContainer = document.querySelector(this.paginationSelector);

        groupListContainer.innerHTML = '';

        if (!this.allGroups.length) {
            groupListContainer.innerHTML = '<p>No groups available.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        const totalItems = this.allGroups.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
        const currentGroups = this.allGroups.slice(startIndex, endIndex);

        currentGroups.forEach(group => {
            const groupItem = this.createGroupItem(group, userId);
            groupListContainer.appendChild(groupItem);
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
        this.renderGroups(userId);
    };
}

new GroupRenderer(
    'http://localhost:8081/groups/all',
    '.group-list',
    '#pagination'
);
