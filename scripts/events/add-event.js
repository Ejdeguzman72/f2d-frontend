document.addEventListener('DOMContentLoaded', () => {
    const addEventButton = document.getElementById('add-event-button');
    const myAddModal = document.getElementById('myAddModal');
    const addModalCloseBtn = document.getElementById('addModalCloseBtn');
    const addModalContent = document.getElementById('addModalContent');
    let groupsDropdown;
    let groups = [];

    // Open modal when add button is clicked
    addEventButton.addEventListener('click', () => {
        openAddModal();
    });

    // Fetch groups from the API
    const fetchGroups = async () => {
        try {
            // Replace this with JWT integration if required
            const response = await axios.get('http://localhost:8081/groups/all');
            groups = response.data.list; // Store groups in state
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    // Render dropdown options
    const renderGroupsDropdown = () => {
        groupsDropdown.innerHTML = ''; // Clear any existing options

        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.groupId; // Ensure correct key for group ID
            option.text = group.groupName;
            groupsDropdown.appendChild(option); // Append option to dropdown
        });
    };

    // Open modal and populate content
    const openAddModal = async () => {
        // Fetch and render groups before showing modal
        await fetchGroups();

        // Populate modal content
        addModalContent.innerHTML = `
            <h2>Create New Event</h2><hr />
            <div class="modal-body">
                <input class="input" type="text" name="eventName" placeholder="Name of Event" />
                <input class="input" type="text" name="eventType" placeholder="Event Type" /><br />
                <textarea class="textarea" cols="50" rows="5" placeholder="Description"></textarea><br />
                <input class="input" type="date" name="eventDate" placeholder="Date" /><br />
                <label for="groupsDropdown">Select Groups:</label>
                <select id="groupsDropdown" name="groupId"></select> <!-- Dropdown -->
                <br><br>
            </div><hr />
            <button id="submitBtn" class="add-button">Submit</button><br /><br />
        `;

        groupsDropdown = document.getElementById('groupsDropdown');
        renderGroupsDropdown(); // Populate dropdown with group data

        // Add event listener for submit button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.addEventListener('click', () => submitInfo());

        // Display the modal
        myAddModal.style.display = 'block';
    };

    // Close modal when close button is clicked
    addModalCloseBtn.onclick = () => {
        myAddModal.style.display = 'none';
    };

    // Close modal if clicked outside the modal
    window.onclick = (event) => {
        if (event.target === myAddModal) {
            myAddModal.style.display = 'none';
        }
    };

    // Submit event information
    const submitInfo = async () => {
        try {
            // Get form values
            const eventName = document.querySelector('input[name="eventName"]').value;
            const eventType = document.querySelector('input[name="eventType"]').value;
            const description = document.querySelector('textarea').value;
            const eventDate = document.querySelector('input[name="eventDate"]').value;
            const groupId = document.querySelector('select[name="groupId"]').value;

            // Validate required fields
            if (!eventName || !eventType || !description || !eventDate || !groupId) {
                throw new Error('Please fill in all required fields.');
            }

            // Prepare event data
            const data = { eventName, eventType, description, eventDate, groupId };

            // Replace this with JWT integration if required
            const response = await axios.post('http://localhost:8082/events/create', data);
            console.log('Event created successfully:', response.data);

            // Close the modal and refresh the page
            myAddModal.style.display = 'none';
            window.location.reload();
        } catch (error) {
            console.error('Error submitting event information:', error.message);
        }
    };
});
