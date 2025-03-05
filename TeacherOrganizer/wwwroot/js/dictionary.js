import * as api from "./api_dictionary.js";

// Загружаем HTML-шаблон
async function loadDictionaryModal() {
    try {
        const response = await fetch("/modals/dictionary.html"); // Исправленный путь
        if (!response.ok) throw new Error("Failed to load dictionary modal");

        const html = await response.text();
        const modalContainer = document.createElement("div");
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);

        console.log("📥 Dictionary modal loaded!");
    } catch (error) {
        console.error("❌ Error loading dictionary modal:", error);
    }
}

// Инициализация списка словарей
export async function initializeDictionary(contentPlaceholder) {
    console.log("📖 Initializing dictionary...");

    await loadDictionaryModal(); // Загружаем модалку перед списком

    try {
        const dictionaries = await api.getDictionaries();
        console.log("📥 Received dictionaries:", dictionaries);

        const listContainer = document.querySelector("#dictionaries-list");
        if (!listContainer) throw new Error("Element #dictionaries-list not found!"); // Отлавливаем ошибку заранее

        listContainer.innerHTML = ""; // Очищаем список

        dictionaries.forEach(dictionary => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5>${dictionary.name}</h5>
                        <small>Author: ${dictionary.user.userName} | Words: ${dictionary.WordsCount}</small>
                    </div>
                    <button class="btn btn-primary toggle-btn">
                        ▼
                    </button>
                </div>
                <div class="dictionary-content collapse"></div>
            `;

            // Добавляем функционал кнопки раскрытия
            const toggleBtn = listItem.querySelector(".toggle-btn");
            const contentDiv = listItem.querySelector(".dictionary-content");

            toggleBtn.addEventListener("click", async () => {
                if (!contentDiv.innerHTML) {
                    const dictionaryDetails = await api.getDictionaryById(dictionary.DictionaryId);
                    contentDiv.innerHTML = `<p>${JSON.stringify(dictionaryDetails.Words, null, 2)}</p>`;
                }
                contentDiv.classList.toggle("show");
            });

            listContainer.appendChild(listItem);
        });

        contentPlaceholder.appendChild(listContainer);
    } catch (error) {
        console.error("❌ Error fetching dictionaries:", error);
        contentPlaceholder.innerHTML = "<p>Error loading dictionaries.</p>";
    }
}
