fetch('/api/Auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: 'username', password: 'password' })
})
    .then(response => response.json())
    .then(data => {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;  // перенаправляем на указанный URL
        } else {
            console.error(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
