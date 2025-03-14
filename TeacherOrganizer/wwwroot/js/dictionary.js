import * as api from "./api_dictionary.js";

// У файлі dictionary.js
async function loadDictionaryView() {
    const response = await fetch('/modals/dictionary.html');
    const html = await response.text();
    return html;
}
async function loadDictionaryModal() {

    console.log("Dictionary modal loading skipped");
    return;
}
export async function initializeDictionary(contentPlaceholder) {
    console.log("📖 Initializing dictionary...");

    // Завантажуємо HTML розмітку
    try {
        const viewHtml = await loadDictionaryView();
        contentPlaceholder.innerHTML = viewHtml;

        // Завантажуємо модальне вікно (якщо потрібно)
        await loadDictionaryModal();

        const dictionaries = await api.getDictionaries();
        console.log("📥 Received dictionaries:", dictionaries);

        const listContainer = document.querySelector("#dictionaries-list");
        if (!listContainer) throw new Error("Element #dictionaries-list not found!");

        listContainer.innerHTML = "";

        if (dictionaries.length === 0) {
            listContainer.innerHTML = "<li class='list-group-item'>Немає доступних словників</li>";
            return;
        }

        // Обробляємо кожен словник
        for (const dictionary of dictionaries) {
            const template = document.querySelector("#dictionary-item-template");
            const listItem = template.content.cloneNode(true);

            // Заповнюємо базову інформацію
            listItem.querySelector(".dictionary-name").textContent = dictionary.name;

            // Отримуємо інформацію про автора
            try {
                const author = await api.getUserById(dictionary.userId);
                const metaText = `Author: ${author?.userName || "Unknown"}`;

                listItem.querySelector(".dictionary-meta").textContent = metaText;
            } catch (error) {
                console.error("Error fetching author:", error);
                listItem.querySelector(".dictionary-meta").textContent = "Author: Unknown";
            }

            // Налаштовуємо обробник події для кнопки
            setupToggleButton(listItem, dictionary);

            // Додаємо елемент до списку
            listContainer.appendChild(listItem);
        }
    } catch (error) {
        console.error("❌ Error initializing dictionary:", error);
        contentPlaceholder.innerHTML = `
            <div class="alert alert-danger">
                <h4>Error loading dictionaries</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Допоміжна функція для налаштування кнопки розгортання
function setupToggleButton(listItem, dictionary) {
    const toggleBtn = listItem.querySelector(".toggle-btn");
    const contentDiv = listItem.querySelector(".dictionary-content");

    toggleBtn.addEventListener("click", async () => {
        if (contentDiv.classList.contains("show")) {
            // Згортаємо
            contentDiv.classList.remove("show");
            toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
            </svg>`;
        } else {
            // Розгортаємо і завантажуємо дані, якщо потрібно
            if (!contentDiv.hasChildNodes()) {
                await loadDictionaryWords(contentDiv, dictionary.DictionaryId);
            }

            contentDiv.classList.add("show");
            toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
            </svg>`;
        }
    });
}

// Допоміжна функція для завантаження слів словника
async function loadDictionaryWords(contentDiv, dictionaryId) {
    contentDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';

    try {
        const dictionaryDetails = await api.getDictionaryById(dictionaryId);

        // Створюємо список слів
        if (dictionaryDetails.Words && dictionaryDetails.Words.length > 0) {
            const wordsList = document.createElement("div");
            wordsList.classList.add("mt-3");

            const wordTemplate = document.querySelector("#dictionary-word-template");

            dictionaryDetails.Words.forEach(word => {
                const wordElement = wordTemplate.content.cloneNode(true);
                wordElement.querySelector(".word-original").textContent = word.original;
                wordElement.querySelector(".word-translation").textContent = `Translation: ${word.translation}`;
                wordsList.appendChild(wordElement);
            });

            contentDiv.innerHTML = '';
            contentDiv.appendChild(wordsList);
        } else {
            contentDiv.innerHTML = '<p class="mt-3">This dictionary contains no words.</p>';
        }
    } catch (error) {
        console.error("Error loading dictionary details:", error);
        contentDiv.innerHTML = '<p class="text-danger mt-3">Error loading dictionary details.</p>';
    }
}