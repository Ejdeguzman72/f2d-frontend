class GroupRenderer {
    constructor(apiUrl, containerSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.init();
    }

    init = () => {
        document.addEventListener('DOMContentLoaded', this.renderGroups);
    }

    fetchGroupData = async () => {
        try {
            const response = await axios.get(this.apiUrl);
            console.log(response)
            return response.data.list;
        } catch (error) {
            console.error('Error fetching group data:', error);
            throw error;
        }
    }

    createGroupItem = (group) => {
        const groupItem = document.createElement('div');
        groupItem.classList.add('group-item');

        groupItem.innerHTML = `
            <h3>${group.groupName}</h3>
            <p>Type: ${group.groupType}</p>
            <p>Members: ${group.userIdSet.length}</p>
            <a href="group-details.html?groupId=${group.groupId}" class="btn">View Group</a>
        `;

        return groupItem;
    }

    renderGroups = async () => {
        const groupListContainer = document.querySelector(this.containerSelector);
        console.log(groupListContainer);
        try {
            const groups = await this.fetchGroupData();
            groups.forEach(group => {
                const groupItem = this.createGroupItem(group);
                groupListContainer.appendChild(groupItem);
            });
        } 
        catch (error) {
            console.log(error);
            groupListContainer.innerHTML = '<p>Failed to load groups. Please try again later.</p>';
        }
    }
}

// Create an instance of the class to render the groups
new GroupRenderer('http://192.168.1.54:8081/groups/all', '.group-list');
