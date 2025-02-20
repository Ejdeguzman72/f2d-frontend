document.addEventListener('DOMContentLoaded', () => {
    const addEventButton = document.getElementById('add-event-button');
    const myAddModal = document.getElementById('myAddModal');
    const addModalCloseBtn = document.getElementById('addModalCloseBtn');
    const addModalContent = document.getElementById('addModalContent');
    let groupsDropdown;
    let f2dAnnouncementGroup = [];

    // Fetch groups from the API
    const fetchGroups = async () => {
        try {
            const response = await axios.get('http://192.168.1.54:8081/groups/all');
            groups = response.data.list; // Store groups in state
    
            const specificGroupName = "F2D ANNOUNCEMENT GROUP";
            // Filter groups based on the specific name
            f2dAnnouncementGroup = groups.filter(group => group.groupName === specificGroupName);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };    

    // Render groups dropdown options
    const renderGroupsDropdown = () => {
        groupsDropdown.innerHTML = ''; // Clear existing options

        f2dAnnouncementGroup.forEach(group => {
            console.log(group)
            const option = document.createElement('option');
            option.value = group.groupId; // Ensure correct groupId field
            option.text = group.groupName;
            groupsDropdown.appendChild(option);
        });
    };

    // Open the modal
    const openAddModal = async () => {
        await fetchGroups(); // Fetch groups before showing modal

        // Populate modal content
        addModalContent.innerHTML = `
            <h2>Create New Announcement</h2><hr />
            <div class="modal-body">
                <input class="input" type="text" name="title" placeholder="Title" />
                <textarea class="textarea" cols="50" rows="5" name="content" placeholder="Write Announcement"></textarea><br />
                <label for="groupsDropdown">Select Groups:</label>
                <select id="groupsDropdown" name="groupId"></select>
                <br><br>
            </div><hr />
            <button id="submitBtn" class="add-button">Submit</button><br /><br />
        `;

        groupsDropdown = document.getElementById('groupsDropdown');
        renderGroupsDropdown(); // Populate dropdown with groups

        // Add event listener for the submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', submitInfo);
        }

        myAddModal.style.display = 'block'; // Show the modal
    };

    // Submit announcement information
    const submitInfo = async () => {
        try {
            const title = document.querySelector('input[name="title"]').value.trim();
            const content = document.querySelector('textarea[name="content"]').value.trim();
            const groupId = document.querySelector('select[name="groupId"]').value;

            // Validate required fields
            if (!title || !content || !groupId) {
                alert('Please fill in all required fields.');
                return;
            }

            const data = { title, content, groupId };

            // POST request to create the announcement
            const response = await axios.post('http://192.168.1.54:8081/group-message/create', data);

            console.log('Announcement created successfully:', response.data);

            // Close the modal and refresh the page
            myAddModal.style.display = 'none';
            window.location.reload();
        } catch (error) {
            console.error('Error submitting announcement information:', error.message);
            alert('Failed to create the announcement. Please try again.');
        }
    };

    // Event listener for the add button
    if (addEventButton) {
        addEventButton.addEventListener('click', openAddModal);
    }

    // Event listener for the close button
    if (addModalCloseBtn) {
        addModalCloseBtn.onclick = () => {
            if (myAddModal) {
                myAddModal.style.display = 'none';
            }
        };
    }

    // Event listener for clicking outside the modal
    window.onclick = (event) => {
        if (myAddModal && event.target === myAddModal) {
            myAddModal.style.display = 'none';
        }
    };
});
