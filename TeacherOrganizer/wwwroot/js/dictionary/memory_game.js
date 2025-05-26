let flippedCards = [];
let lockBoard = false;

export function launchMemoryGame(words) {
    console.log("Launching memory game with words:", words);

    // Перевірити чи існує оверлей, якщо ні - створити
    let overlay = document.getElementById("memory-game-overlay");
    if (!overlay) {
        overlay = createGameOverlay();
        document.body.appendChild(overlay);
    }

    // Показати оверлей
    overlay.style.display = "flex";

    // Очистити контейнер
    const gameContainer = document.getElementById("memory-game-container");
    gameContainer.innerHTML = "";

    // Створити масив карток (слово + переклад для кожного слова)
    const cards = [];
    words.forEach(word => {
        const card1 = createMemoryCard(word.text, word.wordId);
        const card2 = createMemoryCard(word.translation, word.wordId);
        cards.push(card1, card2);
    });

    // Перемішати картки
    const shuffledCards = shuffleArray(cards);

    // Додати картки до контейнера
    shuffledCards.forEach(card => {
        gameContainer.appendChild(card);
        // Додати обробник подій для кожної картки
        card.addEventListener("click", () => flipCard(card));
    });

    // Обробник закриття гри
    const closeBtn = document.getElementById("close-memory-game");
    closeBtn.replaceWith(closeBtn.cloneNode(true)); // Видалити старі обробники
    document.getElementById("close-memory-game").addEventListener("click", () => {
        document.getElementById("memory-game-overlay").style.display = "none";
        // Скинути стан гри
        flippedCards = [];
        lockBoard = false;
    });
}

function createMemoryCard(word, id) {
    const card = document.createElement("div");
    card.classList.add("memory-card");
    card.dataset.id = id;
    card.style.cssText = `
        width: 120px;
        height: 120px;
        perspective: 1000px;
        position: relative;
        cursor: pointer;
    `;

    const inner = document.createElement("div");
    inner.classList.add("memory-card-inner");
    inner.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
    `;

    const cardBack = document.createElement("div");
    cardBack.classList.add("card-back");
    cardBack.textContent = "❓";
    cardBack.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
        user-select: none;
        border: 2px solid #e0e0e0;
        background-color: #ffffff;
        color: #666;
    `;

    const cardFront = document.createElement("div");
    cardFront.classList.add("card-front");
    cardFront.textContent = word;
    cardFront.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
        user-select: none;
        border: 2px solid #e0e0e0;
        text-align: center;
        padding: 8px;
        word-wrap: break-word;
        overflow-wrap: break-word;
        background-color: #ffffff;
        transform: rotateY(180deg);
        color: #333;
        line-height: 1.2;
    `;

    inner.appendChild(cardBack);
    inner.appendChild(cardFront);
    card.appendChild(inner);

    return card;
}

function flipCard(card) {
    if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) return;

    card.classList.add("flipped");
    card.querySelector(".memory-card-inner").style.transform = "rotateY(180deg)";
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        lockBoard = true;
        const [first, second] = flippedCards;

        if (first.dataset.id === second.dataset.id) {
            // Співпадіння знайдено
            setTimeout(() => {
                first.classList.add("matched");
                second.classList.add("matched");

                // Зробити картки зеленими
                [first, second].forEach(matchedCard => {
                    const front = matchedCard.querySelector(".card-front");
                    const back = matchedCard.querySelector(".card-back");
                    front.style.backgroundColor = "#4caf50";
                    front.style.color = "white";
                    front.style.borderColor = "#2e7d32";
                    back.style.backgroundColor = "#4caf50";
                    back.style.color = "white";
                    back.style.borderColor = "#2e7d32";
                });

                flippedCards = [];
                lockBoard = false;

                // Перевірити чи всі картки знайдені
                checkGameComplete();
            }, 500);
        } else {
            // Не співпадають - перевернути назад
            setTimeout(() => {
                first.classList.remove("flipped");
                second.classList.remove("flipped");
                first.querySelector(".memory-card-inner").style.transform = "rotateY(0deg)";
                second.querySelector(".memory-card-inner").style.transform = "rotateY(0deg)";
                flippedCards = [];
                lockBoard = false;
            }, 1000);
        }
    }
}

function checkGameComplete() {
    const gameContainer = document.getElementById("memory-game-container");
    const allCards = gameContainer.querySelectorAll(".memory-card");
    const matchedCards = gameContainer.querySelectorAll(".memory-card.matched");

    if (allCards.length === matchedCards.length) {
        setTimeout(() => {
            alert("Вітаємо! Ви завершили гру!");
        }, 500);
    }
}

function createGameOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "memory-game-overlay";
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.85);
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    `;

    const closeBtn = document.createElement("button");
    closeBtn.id = "close-memory-game";
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 1.5rem;
        padding: 0.5rem 1rem;
        background-color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        color: #333;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
    `;

    const gameContainer = document.createElement("div");
    gameContainer.id = "memory-game-container";
    gameContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(5, 120px);
        gap: 20px;
        justify-content: center;
        padding: 20px;
        max-width: 700px;
    `;

    overlay.appendChild(closeBtn);
    overlay.appendChild(gameContainer);

    return overlay;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}