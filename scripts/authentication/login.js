async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    try {
        const response = await fetch('http://192.168.1.54:8080/auth/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.token)
            localStorage.setItem('F2DToken', data.token);
            window.location.href = 'home-page.html';
        } else {
            alert('Authentication failed.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login.');
    }
}

// Prevent default form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    login();
});
