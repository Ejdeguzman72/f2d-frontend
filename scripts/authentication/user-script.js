// Function to fetch user details from JWT
async function getUserDetailsFromJWT() {
    const token = localStorage.getItem('F2DToken');
    if (!token) {
        console.log("Token not found in local storage.");
        return null;
    }

    try {
        console.log("Decoding JWT token...");
        const decoded = jwt_decode(token);

        // Check if the token is expired
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
            alert('Session expired. Please log in again.');
            console.log("Token has expired.");
            return null;
        }

        console.log("Token is valid. Fetching user details...");
        const username = decoded.sub;

        const response = await fetch(`http://192.168.1.54:8080/users/search/username/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch user details: ${response.statusText}`);
            alert('User details not available');
            return null;
        }

        const userData = await response.json();
        console.log('User details fetched successfully:', userData);
        return userData.user;
    } catch (error) {
        console.error('Error retrieving user details:', error);
        alert('Error retrieving user details');
        return null;
    }
}

// Function to render the profile header
const renderProfileHeaderItem = (user) => {
    const userEntry = document.createElement('div');
    userEntry.innerHTML = `
        <h3>${user.firstname || ''} ${user.lastname || ''}</h3>
        <p>Username: ${user.username}</p>
        <p>Email: ${user.email}</p>`;
    return userEntry;
};

// Function to render the profile details
const renderProfileDetailItem = (user) => {
    const userEntry = document.createElement('div');
    userEntry.innerHTML = `
        <h3>About Me</h3>
        <p>${user.description || 'No description available.'}</p>
        <h3>Interests</h3>`;

    const interestsList = document.createElement('ul');
    if (user.interests && user.interests.length > 0) {
        user.interests.forEach(interest => {
            const li = document.createElement('li');
            li.textContent = interest;
            interestsList.appendChild(li);
        });
    } else {
        const noInterests = document.createElement('p');
        noInterests.textContent = 'No interests available.';
        userEntry.appendChild(noInterests);
    }

    userEntry.appendChild(interestsList);
    return userEntry;
};

// Function to render the user's information
const renderUserInfo = async () => {
    const profileHeaderContainer = document.querySelector('.profile-header');
    const profileDetailsContainer = document.querySelector('.profile-details');
    profileHeaderContainer.innerHTML = '<p>Loading user profile...</p>'; // Show loading message
    profileDetailsContainer.innerHTML = ''; // Clear any previous details

    try {
        const user = await getUserDetailsFromJWT();
        profileHeaderContainer.innerHTML = ''; // Clear loading message

        if (user) {
            const userInfo = renderProfileHeaderItem(user);
            profileHeaderContainer.appendChild(userInfo); // Append user info

            const userDetails = renderProfileDetailItem(user);
            profileDetailsContainer.appendChild(userDetails); // Append user details
        } else {
            profileHeaderContainer.innerHTML = '<p>No user profile available</p>';
        }
    } catch (error) {
        profileHeaderContainer.innerHTML = '<p>Failed to load user profile info</p>';
        profileDetailsContainer.innerHTML = ''; // Clear details on failure
        console.error('Error rendering user info:', error);
    }
};

// Function for editing profile (placeholder)
function editProfile() {
    alert("Edit Profile functionality not implemented yet.");
}

// Function for logging out
function logout() {
    // Clear the JWT token from local storage
    localStorage.removeItem('F2DToken');
    // Redirect to login page or home page
    window.location.href = 'index.html';
}

// Add the event listener to load user info after DOM content is loaded
document.addEventListener('DOMContentLoaded', renderUserInfo);
