import * as api from "./api_dictionary.js";

async function loadDictionaryView() {
    const response = await fetch('/modals/dictionary.html');
    return await response.text();
}

async function loadDictionaryModal() {
    console.log("Dictionary modal loading skipped");
    return;
}

export async function initializeDictionary(contentPlaceholder) {
    console.log("📖 Initializing dictionary...");

    try {
        const viewHtml = await loadDictionaryView();
        contentPlaceholder.innerHTML = viewHtml;

        await loadDictionaryModal();

        // Додаємо обробники після завантаження HTML
        document.querySelector("#showUserDictionaries").addEventListener("click", () => loadDictionaries(true));
        document.querySelector("#showAllDictionaries").addEventListener("click", () => loadDictionaries(false));
        document.querySelector("#filterName").addEventListener("input", applyFilters);
        document.querySelector("#filterAuthor").addEventListener("input", applyFilters);

        // Завантажуємо словники користувача за замовчуванням
        await loadDictionaries(true);
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

// Глобальний масив для збереження словників
let dictionaries = [];

async function loadDictionaries(onlyUserDictionaries) {
    try {
        dictionaries = onlyUserDictionaries ? await api.getDictionaries() : await api.getDictionariesAll();
        console.log("📥 Received dictionaries:", dictionaries);

        applyFilters(); // Застосовуємо фільтри після завантаження
    } catch (error) {
        console.error("Error fetching dictionaries:", error);
    }
}

async function applyFilters() {
    const filterName = document.querySelector("#filterName").value.toLowerCase();
    const filterAuthor = document.querySelector("#filterAuthor").value.toLowerCase();
    const listContainer = document.querySelector("#dictionaries-list");

    if (!listContainer) {
        console.error("Element #dictionaries-list not found!");
        return;
    }

    listContainer.innerHTML = "";
    const filteredDictionaries = dictionaries.filter(dictionary =>
        dictionary.name.toLowerCase().includes(filterName) &&
        (!dictionary.userId || (dictionary.userId && dictionary.userId !== null && dictionary.userId.toLowerCase().includes(filterAuthor)))
    );

    if (filteredDictionaries.length === 0) {
        listContainer.innerHTML = "<li class='list-group-item'>There are no available dictionariesв</li>";
        return;
    }

    const promises = filteredDictionaries.map(async dictionary => {
        const template = document.getElementById("dictionary-item-template").content.cloneNode(true);
        const listItem = template.querySelector(".list-group-item");

        listItem.querySelector(".dictionary-name").textContent = dictionary.name;

        try {
            const author = await api.getUserById(dictionary.userId);
            listItem.querySelector(".dictionary-meta").textContent = `Author: ${author?.userName || "Unknown"}`;
        } catch (error) {
            console.error("Error fetching author:", error);
            listItem.querySelector(".dictionary-meta").textContent = "Author: Unknown";
        }

        // Викликаємо setupToggleButton для кожного елемента списку
        setupToggleButton(listItem, dictionary);

        return listItem;
    });

    const listItems = await Promise.all(promises);

    listItems.forEach(listItem => {
        listContainer.appendChild(listItem);
    });
}

function setupToggleButton(listItem, dictionary) {
    const toggleBtn = listItem.querySelector(".toggle-btn");
    const contentDiv = listItem.querySelector(".dictionary-content");

    toggleBtn.addEventListener("click", async () => {
        if (contentDiv.classList.contains("show")) {
            contentDiv.classList.remove("show");
            toggleBtn.innerHTML = "▼";
        } else {
            if (!contentDiv.hasChildNodes()) {
                await loadDictionaryWords(contentDiv, dictionary.dictionaryId);
            }
            contentDiv.classList.add("show");
            toggleBtn.innerHTML = "▲";
        }
    });
}

async function loadDictionaryWords(contentDiv, dictionaryId) {
    contentDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';

    try {
        const dictionaryDetails = await api.getDictionaryById(dictionaryId);

        if (dictionaryDetails.words && dictionaryDetails.words.length > 0) {
            const wordsList = document.createElement("div");
            wordsList.classList.add("mt-3");

            dictionaryDetails.words.forEach(word => {
                const wordElement = document.createElement("div");
                wordElement.classList.add("word-item");
                wordElement.innerHTML = `<strong>${word.text}</strong> - ${word.translation}`;
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
