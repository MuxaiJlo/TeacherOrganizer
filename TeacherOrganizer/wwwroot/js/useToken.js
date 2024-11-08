// useToken.js
const token = localStorage.getItem('jwtToken');

if (token) {
    // Спочатку робимо запит на сервер для перевірки токена або отримання даних
    fetch('/api/SomeProtectedRoute', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,  // Передаємо токен у заголовку
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.status === 401) {
                alert("Unauthorized");
                window.location.href = '/login';  // Перенаправляємо на сторінку логіну
            }
            return response.json();
        })
        .then(data => {
            // Якщо сервер повернув redirectUrl, перенаправляємо користувача на цей URL
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;  // Перенаправляємо на зазначену сторінку
            } else {
                console.log("No redirect URL found.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
} else {
    alert("No token found.");
    window.location.href = '/login';  // Перенаправляємо на сторінку логіну
}
