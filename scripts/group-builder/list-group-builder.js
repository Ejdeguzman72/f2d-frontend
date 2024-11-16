class GroupRenderer {
    constructor(apiUrl, containerSelector, paginationSelector) {
        this.apiUrl = apiUrl;
        this.containerSelector = containerSelector;
        this.paginationSelector = paginationSelector;
        this.currentPage = 1;
        this.itemsPerPage = 5; // Adjust as needed
        this.init();
    }

    init = () => {
        document.addEventListener('DOMContentLoaded', this.renderGroups);
    }

    fetchGroupData = async () => {
        try {
            const response = await axios.get(this.apiUrl);
            console.log(response);
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
        const paginationContainer = document.querySelector(this.paginationSelector);
        groupListContainer.innerHTML = ''; // Clear container
        try {
            const allGroups = await this.fetchGroupData();

            // Pagination logic
            const totalItems = allGroups.length;
            const totalPages = Math.ceil(totalItems / this.itemsPerPage);
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;

            const currentGroups = allGroups.slice(startIndex, endIndex);

            currentGroups.forEach(group => {
                const groupItem = this.createGroupItem(group);
                groupListContainer.appendChild(groupItem);
            });

            this.renderPagination(totalPages);
        } catch (error) {
            console.error(error);
            groupListContainer.innerHTML = '<p>Failed to load groups. Please try again later.</p>';
        }
    }

    renderPagination = (totalPages) => {
        const paginationContainer = document.querySelector(this.paginationSelector);
        paginationContainer.innerHTML = ''; // Clear container
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.classList.add('pagination-button');
            if (i === this.currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => this.onPageClick(i));
            paginationContainer.appendChild(button);
        }
    }

    onPageClick = (page) => {
        this.currentPage = page;
        this.renderGroups();
    }
}

// Create an instance of the class to render the groups with pagination
new GroupRenderer(
    'http://192.168.1.54:8081/groups/all',
    '.group-list',
    '#pagination'
);
