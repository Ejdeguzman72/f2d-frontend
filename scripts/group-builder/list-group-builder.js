class GroupRenderer {
    constructor(apiUrl, containerSelector, paginationSelector) {
        this.apiUrl = apiUrl; // API URL for fetching group data
        this.containerSelector = containerSelector; // Selector for group list container
        this.paginationSelector = paginationSelector; // Selector for pagination container
        this.currentPage = 1; // Current page number
        this.itemsPerPage = 5; // Groups per page
        this.allGroups = []; // Store all fetched groups
        this.init();
    }

    // Initialize the renderer
    init = async () => {
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('DOMContentLoaded event triggered'); // Debugging log
            await this.loadGroupData();
            this.renderGroups();
        });
    };

    // Fetch and load group data from API
    loadGroupData = async () => {
        try {
            const response = await axios.get(this.apiUrl);
            this.allGroups = response.data.list || []; // Ensure we have an array
            console.log('Groups loaded:', this.allGroups); // Debugging log
        } catch (error) {
            console.error('Error fetching group data:', error);
            this.allGroups = [];
        }
    };

    // Create a single group item element
    createGroupItem = (group) => {
        const groupItem = document.createElement('div');
        groupItem.classList.add('group-item');

        groupItem.innerHTML = `
            <h3>${group.groupName}</h3>
            <p>Type: ${group.groupType}</p>
            <p>Members: ${group.userIdSet.length}</p>
            <a href="group-info-page.html?groupId=${group.groupId}" class="btn">View Group</a>
        `;

        return groupItem;
    };

    // Render groups for the current page
    renderGroups = () => {
        const groupListContainer = document.querySelector(this.containerSelector);
        const paginationContainer = document.querySelector(this.paginationSelector);

        groupListContainer.innerHTML = ''; // Clear previous groups

        if (!this.allGroups.length) {
            groupListContainer.innerHTML = '<p>No groups available.</p>';
            paginationContainer.innerHTML = ''; // Clear pagination
            return;
        }

        const totalItems = this.allGroups.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        // Determine current page's items
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
        const currentGroups = this.allGroups.slice(startIndex, endIndex);

        currentGroups.forEach(group => {
            const groupItem = this.createGroupItem(group);
            groupListContainer.appendChild(groupItem);
        });

        // Render pagination controls
        this.renderPagination(totalPages);
    };

    // Render pagination controls
    renderPagination = (totalPages) => {
        const paginationContainer = document.querySelector(this.paginationSelector);
        paginationContainer.innerHTML = ''; // Clear previous buttons
    
        if (totalPages <= 1) return; // No pagination needed for a single page
    
        const maxVisiblePages = 5; // Number of visible numeric buttons
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1); // Reassignment now valid
        }
    
        // "First" button
        const firstButton = this.createPaginationButton('First', this.currentPage > 1, () => this.onPageClick(1));
        paginationContainer.appendChild(firstButton);
    
        // "Previous" button
        const prevButton = this.createPaginationButton('Prev', this.currentPage > 1, () => this.onPageClick(this.currentPage - 1));
        paginationContainer.appendChild(prevButton);
    
        // Numeric buttons
        for (let i = startPage; i <= endPage; i++) {
            const button = this.createPaginationButton(i, true, () => this.onPageClick(i));
            if (i === this.currentPage) {
                button.classList.add('active');
            }
            paginationContainer.appendChild(button);
        }
    
        // "Next" button
        const nextButton = this.createPaginationButton('Next', this.currentPage < totalPages, () => this.onPageClick(this.currentPage + 1));
        paginationContainer.appendChild(nextButton);
    
        // "Last" button
        const lastButton = this.createPaginationButton('Last', this.currentPage < totalPages, () => this.onPageClick(totalPages));
        paginationContainer.appendChild(lastButton);
    };    

    // Create a pagination button
    createPaginationButton = (label, isEnabled, onClick) => {
        const button = document.createElement('button');
        button.textContent = label;
        button.disabled = !isEnabled;
        button.classList.add('pagination-button');
        if (isEnabled) {
            button.addEventListener('click', onClick);
        }
        return button;
    };

    // Handle page click
    onPageClick = (page) => {
        this.currentPage = page;
        console.log('Navigated to page:', page); // Debugging log
        this.renderGroups();
    };
}

// Create an instance of the class to render the groups
new GroupRenderer(
    'http://192.168.1.54:8081/groups/all', // Replace with your API endpoint
    '.group-list', // Selector for the group list container
    '#pagination' // Selector for the pagination container
);
