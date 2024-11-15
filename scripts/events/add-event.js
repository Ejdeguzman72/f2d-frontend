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
        <h2>Create New Event</h2><hr />
        <div class="modal-body">
            <input class="input" type="text" name="eventName" placeholder="Name of Event" />
            <input class="input" type="text" name="eventType" placeholder="Event Type" /><br />
            <textarea class="textarea" cols="50" rows="5" placeholder="Description"></textarea><br />
             <input class="input" type="date" name="eventDate" placeholder="Date" /><br />
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
            const eventName = document.querySelector('input[name="eventName"]').value;
            const eventType = document.querySelector('input[name="eventType"]').value;
            const description = document.querySelector('textarea').value;
            const eventDate = document.querySelector('input[name="eventDate"]').value;

            // Validate required fields
            if (!eventName || !eventType || !description || !eventDate) {
                throw new Error('Please fill in all required fields.');
            }

            const data = { eventName, eventType, description, eventDate };
            // const jwtToken = await retrieveJwt();

            // const axiosWithToken = axios.create({
            //     headers: {
            //         Authorization: `Bearer ${jwtToken}`,
            //         'Content-Type': 'application/json',
            //     },
            // });

            // POST request to add event
            const response = await axios.post('http://192.168.1.54:8082/events/create', data);
            console.log('Event created successfully:', response.data);

            // Close the modal
            myAddModal.style.display = 'none';

           window.location.reload();
        } catch (error) {
            console.error('Error submitting event information:', error.message);
        }
    };
});
