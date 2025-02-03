document.addEventListener("DOMContentLoaded", function () {
    const bubbleContainer = document.getElementById("bubble-container");

    function createBubble() {
        const bubble = document.createElement("div");
        bubble.classList.add("bubble");

        const size = Math.random() * 60 + 10; // Розмір від 10 до 70 px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        bubble.style.left = `${Math.random() * 100}vw`;
        bubble.style.animationDuration = `${Math.random() * 10 + 5}s`;
        bubble.style.animationDelay = `${Math.random() * 5}s`;

        bubbleContainer.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 15000); // Видаляємо після 15 секунд
    }

    setInterval(createBubble, 500);
});
