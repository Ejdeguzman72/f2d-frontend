let username;

const token = localStorage.getItem('F2DToken');

if (token) {
    axios.get('http://localhost:9001/chatroom/retrieve-username', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        console.log('Response: ', response.data);
    })
    .catch(error => {
        console.log('Error: ', error);
    })
} else {
    console.error('No token found');
}

