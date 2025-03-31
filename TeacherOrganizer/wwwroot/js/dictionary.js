import * as api from "./api_dictionary.js";
import { setupDictionaryModal } from "./dictionary_modal.js";
import { setupDictionaryList } from "./dictionary_list.js";

async function loadDictionaryView() {
    console.log("Loading dictionary view...");
    const response = await fetch('/modals/dictionary.html');
    const viewHtml = await response.text();
    console.log("Dictionary view loaded.");
    return viewHtml;
}

export async function initializeDictionary(contentPlaceholder) {
    console.log("📖 Initializing dictionary...");

    try {
        const viewHtml = await loadDictionaryView();
        contentPlaceholder.innerHTML = viewHtml;

        setupDictionaryModal();
        setupDictionaryList();

        document.querySelector("#showUserDictionaries").addEventListener("click", async () => {
            console.log("📌 Showing user dictionaries...");
            await loadDictionaries(true);
        });

        document.querySelector("#showAllDictionaries").addEventListener("click", async () => {
            console.log("📌 Showing all dictionaries...");
            await loadDictionaries(false);
        });

        document.querySelector("#filterName").addEventListener("input", applyFilters);
        document.querySelector("#filterAuthor").addEventListener("input", applyFilters);

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


let dictionaries = [];

async function loadDictionaries(onlyUserDictionaries) {
    console.log(`Loading ${onlyUserDictionaries ? "user" : "all"} dictionaries...`);
    try {
        dictionaries = onlyUserDictionaries ? await api.getDictionaries() : await api.getDictionariesAll();
        console.log("📥 Received dictionaries:", dictionaries);
        console.log("Type of dictionaries:", typeof dictionaries);
        if (dictionaries) {
            applyFilters();
        } else {
            console.error("Dictionaries is undefined");
        }
    } catch (error) {
        console.error("Error fetching dictionaries:", error);
    }
}
async function applyFilters() {
    console.log("Applying filters...");
    const filterName = document.querySelector("#filterName")?.value.toLowerCase() || "";
    const filterAuthor = document.querySelector("#filterAuthor")?.value.toLowerCase() || "";
    const listContainer = document.querySelector("#dictionaries-list");

    if (!listContainer) {
        console.error("Element #dictionaries-list not found!");
        return;
    }

    console.log("Clearing list container.");
    listContainer.innerHTML = "";

    const filteredDictionaries = dictionaries.filter(dictionary =>
        dictionary.name.toLowerCase().includes(filterName) &&
        (!dictionary.userId || (dictionary.userId && dictionary.userId !== null && dictionary.userId.toLowerCase().includes(filterAuthor)))
    );

    console.log("Filtered dictionaries:", filteredDictionaries);
    setupDictionaryList(filteredDictionaries);
}


export { dictionaries, loadDictionaries, applyFilters };