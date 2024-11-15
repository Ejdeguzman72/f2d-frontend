document.addEventListener('DOMContentLoaded', () => {
    const addEventButton = document.getElementById('add-event-button');
    const myAddModal = document.getElementById('myAddModal');
    const addModalCloseBtn = document.getElementById('addModalCloseBtn');
    const addModalContent = document.getElementById('addModalContent');

    // Open modal when add button is clicked
    addEventButton.addEventListener('click', () => {
        openAddModal();
    });

    const openAddModal = () => {
        // Clear the modal content (if needed)
        addModalContent.innerHTML = `
        <h2>Create New Group</h2><hr />
        <div class="modal-body">
            <input class="input" type="text" name="groupName" placeholder="Name of Group" />
            <input class="input" type="text" name="groupType" placeholder="Group Type" /><br />
        </div><hr />
        <button id="submitBtn" class="add-button">Submit</button><br /><br />
    `;

        // Add event listener for submit button after DOM update
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.addEventListener('click', () => submitInfo());

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

    const submitInfo = async () => {
        try {
            // Get book information from the form
            const groupName = document.querySelector('input[name="groupName"]').value;
            const groupType = document.querySelector('input[name="groupType"]').value;

            // Validate required fields
            if (!groupName || !groupType) {
                throw new Error('Please fill in all required fields.');
            }

            const data = { groupName,groupType };
            // const jwtToken = await retrieveJwt();

            // const axiosWithToken = axios.create({
            //     headers: {
            //         Authorization: `Bearer ${jwtToken}`,
            //         'Content-Type': 'application/json',
            //     },
            // });

            // POST request to add book
            const response = await axios.post('http://192.168.1.54:8081/groups/create', data);
            console.log('Group created successfully:', response.data);

            // Close the modal
            myAddModal.style.display = 'none';

            window.location.reload();
        } catch (error) {
            console.error('Error submitting group information:', error.message);
        }
    };
});
