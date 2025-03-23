import * as api from "./api_dictionary.js";
import { dictionaries, loadDictionaries, applyFilters } from "./dictionary.js";
import { loadDictionaryWords } from "./dictionary_words.js";

export function setupDictionaryList(filteredDictionaries) {
    console.log("Setting up dictionary list...");
    const listContainer = document.querySelector("#dictionaries-list");
    console.log("Clearing dictionary list container.");
    listContainer.innerHTML = "";

    if (!filteredDictionaries || filteredDictionaries.length === 0) {
        console.log("No dictionaries to display.");
        listContainer.innerHTML = "<li class='list-group-item'>There are no available dictionaries</li>";
        return;
    }

    console.log("Creating dictionary list items...");
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

        setupDictionaryToggle(listItem, dictionary);

        return listItem;
    });

    Promise.all(promises).then(listItems => {
        console.log("Dictionary list items created.");
        listItems.forEach(listItem => {
            listContainer.appendChild(listItem);
        });
        console.log("Dictionary list setup complete.");
    });
}
function setupDictionaryToggle(listItem, dictionary) {
    const toggleBtn = listItem.querySelector(".toggle-btn");
    const contentDiv = listItem.querySelector(".dictionary-content");
    const addWordBtn = listItem.querySelector(".add-word-btn");
    let addWordFormSetup = false;

    async function toggleDictionaryContent() {
        if (contentDiv.classList.contains("show")) {
            console.log(`Collapsing dictionary ${dictionary.dictionaryId}.`);
            contentDiv.classList.remove("show");
            toggleBtn.innerHTML = "▼";
            addWordBtn.style.display = "none";
            contentDiv.innerHTML = "";
            addWordFormSetup = false;
        } else {
            console.log(`Expanding dictionary ${dictionary.dictionaryId}.`);
            contentDiv.classList.add("show");
            toggleBtn.innerHTML = "▲";
            addWordBtn.style.display = "inline-block";
            await loadDictionaryWords(contentDiv, dictionary.dictionaryId);
            if (!addWordFormSetup) {
                // Отримуємо шаблон з HTML
                const template = document.getElementById("dictionary-item-template").content.querySelector("#addWordFormContainer");
                // Клонуємо шаблон
                const clonedTemplate = template.cloneNode(true);
                // Додаємо клонований шаблон до contentDiv
                contentDiv.appendChild(clonedTemplate);
                // Викликаємо setupAddWordForm
                setupAddWordForm(contentDiv, dictionary.dictionaryId);
                addWordFormSetup = true;
            }
        }
    }

    toggleBtn.addEventListener("click", () => {
        toggleDictionaryContent();
    });

    addWordBtn.addEventListener("click", () => {
        console.log(`Add word button clicked for dictionary ${dictionary.dictionaryId}.`);
        contentDiv.querySelector("#addWordFormContainer").classList.toggle("show");
    });

    if (contentDiv.classList.contains('show')) {
        toggleDictionaryContent()
    }
}

function setupAddWordForm(contentDiv, dictionaryId) {
    const addWordFormContainer = contentDiv.querySelector("#addWordFormContainer");

    contentDiv.querySelector("#addNewWordInput").addEventListener("click", () => {
        console.log(`Add new word input clicked for dictionary ${dictionaryId}.`);
        const wordInput = document.createElement("div");
        wordInput.classList.add("word-input", "d-flex", "align-items-center", "mb-2");
        wordInput.innerHTML = `
            <input type="text" class="form-control flex-grow-1" placeholder="Word">
            <input type="text" class="form-control flex-grow-1" placeholder="Translation">
            <input type="text" class="form-control flex-grow-1" placeholder="Example">
            <button class="btn remove-word border-0 bg-transparent text-danger p-0" style="font-size: 1.5em; line-height: 1;" onmouseover="this.style.color='red';" onmouseout="this.style.color='black';">-</button>
        `;
        addWordFormContainer.insertBefore(wordInput, contentDiv.querySelector("#addNewWordInput"));

        wordInput.querySelector(".remove-word").addEventListener("click", () => {
            console.log(`Remove word clicked for dictionary ${dictionaryId}.`);
            wordInput.remove();
        });
    });

    contentDiv.querySelector("#saveWordButton").addEventListener("click", async () => {
        console.log(`Save word button clicked for dictionary ${dictionaryId}.`);
        const wordInputs = contentDiv.querySelectorAll(".word-input");
        const words = [];

        wordInputs.forEach(input => {
            const word = input.querySelector("input:nth-child(1)").value;
            const translation = input.querySelector("input:nth-child(2)").value;
            const example = input.querySelector("input:nth-child(3)").value;
            if (word && translation) {
                words.push({ Text: word, Translation: translation, Example: example });
            }
        });

        if (words.length === 0) {
            alert("Please enter at least one word.");
            return;
        }

        for (const word of words) {
            await api.addWord({ ...word, DictionaryId: dictionaryId });
        }

        alert("Words added successfully.");
        await loadDictionaryWords(contentDiv, dictionaryId);
        addWordFormContainer.classList.remove("show");
    });

    contentDiv.querySelector("#cancelAddWordButton").addEventListener("click", () => {
        console.log(`Cancel add word clicked for dictionary ${dictionaryId}.`);
        addWordFormContainer.classList.remove("show");
    });
}