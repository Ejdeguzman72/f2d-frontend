document.addEventListener('DOMContentLoaded', () => {
    const addEventButton = document.getElementById('add-event-button');
    const myAddModal = document.getElementById('myAddModal');
    const addModalCloseBtn = document.getElementById('addModalCloseBtn');
    const addModalContent = document.getElementById('addModalContent');

    // Function to open the modal
    const openAddModal = () => {
        if (!addModalContent || !myAddModal) return;

        // Populate the modal content
        addModalContent.innerHTML = `
            <h2>Create New Announcement</h2><hr />
            <div class="modal-body">
                <input class="input" type="text" name="title" placeholder="Title" />
                <textarea class="textarea" cols="50" rows="5" name="content" placeholder="Write Announcement"></textarea><br />
            </div><hr />
            <button id="submitBtn" class="add-button">Submit</button><br /><br />
        `;

        // Add event listener for the submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', submitInfo);
        }

        myAddModal.style.display = 'block';
    };

    // Function to submit the information
    const submitInfo = async () => {
        try {
            const titleInput = document.querySelector('input[name="title"]');
            const contentTextarea = document.querySelector('textarea[name="content"]');

            if (!titleInput || !contentTextarea) {
                throw new Error('Unable to find form inputs.');
            }

            const title = titleInput.value.trim();
            const content = contentTextarea.value.trim();

            // Validate required fields
            if (!title || !content) {
                alert('Please fill in all required fields.');
                return;
            }

            const data = { title, content };

            // Send POST request
            const response = await axios.post('http://192.168.1.54:8081/group-message/create', data);

            // Close the modal
            if (myAddModal) {
                myAddModal.style.display = 'none';
                window.location.reload();
            }
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
