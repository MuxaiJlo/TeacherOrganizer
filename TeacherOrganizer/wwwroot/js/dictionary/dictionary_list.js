// dictionary_list.js

import * as api from "../api/api_dictionary.js";
import { dictionaries, loadDictionaries, applyFilters } from "./dictionary.js";
import { loadDictionaryWords } from "./dictionary_words.js";
import { getUserById } from "../api/api_user.js";
export function setupDictionaryList(filteredDictionaries)
{
    console.log("Setting up dictionary list...");
    const listContainer = document.querySelector("#dictionaries-list");
    console.log("Clearing dictionary list container.");
    listContainer.innerHTML = "";

    if (!filteredDictionaries || filteredDictionaries.length === 0)
    {
        console.log("No dictionaries to display.");
        listContainer.innerHTML = "<li class='list-group-item'>There are no available dictionaries</li>";
        return;
    }

    console.log("Creating dictionary list items...");
    const promises = filteredDictionaries.map(async dictionary =>
    {
        const template = document.getElementById("dictionary-item-template").content.cloneNode(true);
        const listItem = template.querySelector(".list-group-item");

        listItem.querySelector(".dictionary-name").textContent = dictionary.name;

        try
        {
            const author = await getUserById(dictionary.userId);
            listItem.querySelector(".dictionary-meta").textContent = `Author: ${author?.userName || "Unknown"}`;
        } catch (error)
        {
            console.error("Error fetching author:", error);
            listItem.querySelector(".dictionary-meta").textContent = "Author: Unknown";
        }

        setupDictionaryToggle(listItem, dictionary);

        return listItem;
    });

    Promise.all(promises).then(listItems =>
    {
        console.log("Dictionary list items created.");
        listItems.forEach(listItem =>
        {
            listContainer.appendChild(listItem);
        });
        console.log("Dictionary list setup complete.");
    });

    
}

function setupDictionaryToggle(listItem, dictionary)
{
    const toggleBtn = listItem.querySelector(".toggle-btn");
    const contentDiv = listItem.querySelector(".dictionary-content");
    const addWordBtn = listItem.querySelector(".add-word-btn");
    const actionButtons = listItem.querySelectorAll(".dictionary-action-btn");
    let addWordFormSetup = false;

    async function toggleDictionaryContent()
    {
        if (contentDiv.classList.contains("show"))
        {
            console.log(`Collapsing dictionary ${dictionary.dictionaryId}.`);
            contentDiv.classList.remove("show");
            toggleBtn.innerHTML = "▼";
            addWordBtn.style.display = "none";
            console.log("Action buttons found:", actionButtons);
            actionButtons.forEach(btn => btn.style.display = "none");
        } else
        {
            console.log(`Expanding dictionary ${dictionary.dictionaryId}.`);
            contentDiv.classList.add("show");
            toggleBtn.innerHTML = "▲";
            addWordBtn.style.display = "inline-block";
            console.log("Action buttons found:", actionButtons);
            actionButtons.forEach(btn => btn.style.display = "inline-block");

            const wordsTableBody = contentDiv.querySelector(".words-table-body");

            if (wordsTableBody)
            {
                await loadDictionaryWords(wordsTableBody, dictionary.dictionaryId);
            } else
            {
                console.error("Error: words-table-body not found!");
            }

            if (!addWordFormSetup)
            {
                const template = document.getElementById("dictionary-item-template").content.querySelector("#addWordFormContainer");
                const clonedTemplate = template.cloneNode(true);
                contentDiv.querySelector("table").insertAdjacentElement("afterend", clonedTemplate);
                setupAddWordForm(contentDiv, dictionary.dictionaryId);
                addWordFormSetup = true;
            }
        }
    }

    const editDictionaryBtn = listItem.querySelector("#editDictionaryButton");
    const copyDictionaryBtn = listItem.querySelector("#copyDictionaryButton");
    const deleteDictionaryBtn = listItem.querySelector("#deleteDictionaryButton");

    editDictionaryBtn.addEventListener("click", async () =>
    {
        console.log(`Edit dictionary button clicked for dictionary ${dictionary.dictionaryId}.`);
        const modal = document.getElementById("editDictionaryModal");
        const editDictionaryName = modal.querySelector("#editDictionaryName");

        editDictionaryName.value = dictionary.name;
        modal.dataset.dictionaryId = dictionary.dictionaryId;
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    });

    copyDictionaryBtn.addEventListener("click", async () =>
    {
        console.log(`Copy dictionary button clicked for dictionary ${dictionary.dictionaryId}.`);
        if (!dictionary.dictionaryId) {
            alert("Dictionary ID is missing.");
            return;
        }
        try {
            const copied = await api.copyDictionary(dictionary.dictionaryId);
            if (copied) {
                alert("Dictionary copied successfully.");
            } else {
                alert("Failed to copy dictionary.");
            }
        } catch (error) {
            console.error("Error copying dictionary:", error);
            alert("An error occurred while copying the dictionary. Please try again.");
        }
    });

    deleteDictionaryBtn.addEventListener("click", async () => {
        console.log(`Delete dictionary button clicked for dictionary ${dictionary.dictionaryId}.`);
        if (confirm(`Are you sure you want to delete dictionary ${dictionary.dictionaryId}?`)) {
            try {
                const response = await api.deleteDictionary(dictionary.dictionaryId);
                if (response.ok) {
                    alert("Dictionary deleted successfully.");
                    listItem.remove();
                } else if (response.status === 500) {
                    alert("You do not own this dictionary.");
                } else {
                    alert(`Failed to delete dictionary. Server responded with status: ${response.status}`);
                }
            } catch (error) {
                console.error("Error deleting dictionary:", error);
                alert("An unexpected error occurred while deleting the dictionary.");
            }
        }
    });

    toggleBtn.addEventListener("click", () =>
    {
        toggleDictionaryContent();
    });

    addWordBtn.addEventListener("click", () =>
    {
        console.log(`Add word button clicked for dictionary ${dictionary.dictionaryId}.`);
        contentDiv.querySelector("#addWordFormContainer").classList.toggle("show");
    });

    if (contentDiv.classList.contains('show'))
    {
        toggleDictionaryContent()
    }
}

function setupAddWordForm(contentDiv, dictionaryId)
{
    const addWordFormContainer = contentDiv.querySelector("#addWordFormContainer");
    if (!addWordFormContainer)
    {
        console.error("Error: addWordFormContainer not found!");
        return;
    }

    contentDiv.querySelector("#addNewWordInput").addEventListener("click", () =>
    {
        console.log(`Add new word input clicked for dictionary ${dictionaryId}.`);
        const wordInputTemplate = addWordFormContainer.querySelector(".word-input").cloneNode(true);
        addWordFormContainer.insertBefore(wordInputTemplate, contentDiv.querySelector("#addNewWordInput"));

        wordInputTemplate.querySelectorAll("input").forEach(input =>
        {
            input.value = "";
        });
        wordInputTemplate.querySelector(".remove-word").addEventListener("click", () =>
        {
            console.log(`Remove word clicked for dictionary ${dictionaryId}.`);
            wordInputTemplate.remove();
        });
    });

    contentDiv.querySelector("#saveWordButton").addEventListener("click", async () =>
    {
        console.log(`Save word button clicked for dictionary ${dictionaryId}.`);
        const wordInputs = addWordFormContainer.querySelectorAll(".word-input");
        const words = [];

        wordInputs.forEach(input =>
        {
            const word = input.querySelector("input:nth-child(1)").value;
            const translation = input.querySelector("input:nth-child(2)").value;
            const example = input.querySelector("input:nth-child(3)").value;
            if (word && translation)
            {
                words.push({ Text: word, Translation: translation, Example: example });
            }
        });

        if (words.length === 0)
        {
            alert("Please enter at least one word.");
            return;
        }

        for (const word of words)
        {
            await api.addWord({ ...word, DictionaryId: dictionaryId });
        }

        alert("Words added successfully.");
        await loadDictionaryWords(contentDiv, dictionaryId);
        addWordFormContainer.classList.remove("show");
    });

    contentDiv.querySelector("#cancelAddWordButton").addEventListener("click", () =>
    {
        console.log(`Cancel add word clicked for dictionary ${dictionaryId}.`);
        addWordFormContainer.classList.remove("show");
    });
}
