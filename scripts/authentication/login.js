async function login() {
    const username = document.getElementById('username').value;
    console.log(username)
    if (username == '') {
        alert('Username must be filled')
    }
    const password = document.getElementById('password').value;
    if (password == '') {
        alert('Password must be filled');
    }

    try {
        // Make a request to your authentication API endpoint
        const response = await fetch('http://localhost:8080/auth/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();

            // Store the JWT token in localStorage
            localStorage.setItem('ejjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj', data.accessToken);
            
            if (data.accessToken) {
                // Redirect to the home page (you can replace this with your desired URL)
                window.location.href = 'home-page.html';
            }
        } else {
            // Handle authentication failure
            console.error('Authentication failed');
        }
    } catch (error) {
        console.error('Error during login:', error.message);
    }
}
