// login.js
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();  // Забороняємо стандартну відправку форми

    const username = document.querySelector('input[name="Username"]').value;
    const password = document.querySelector('input[name="Password"]').value;

    fetch('/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('jwtToken', data.token);  
                window.location.href = data.redirectUrl || '/';
            } else {
                alert("Login failed.");
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
            alert("Login failed.");
        });
});
