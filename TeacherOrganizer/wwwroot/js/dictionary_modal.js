import * as api from "./api_dictionary.js";
import { loadDictionaries } from "./dictionary.js";

export function setupDictionaryModal() {
    console.log("Setting up dictionary modal...");

    document.querySelector("#createDictionaryButton").addEventListener("click", () => {
        console.log("Create dictionary button clicked.");
        const createDictionaryModal = new bootstrap.Modal(document.getElementById('createDictionaryModal'));
        createDictionaryModal.show();
    });

    const wordsContainer = document.getElementById("wordsContainer");

    document.querySelector("#addWordButton").addEventListener("click", () => {
        console.log("Add word button clicked.");
        const wordInputTemplate = wordsContainer.querySelector(".word-input").cloneNode(true);
        wordsContainer.appendChild(wordInputTemplate);

        wordInputTemplate.querySelector(".remove-word").addEventListener("click", () => {
            console.log("Remove word button clicked.");
            wordInputTemplate.remove();
        });
    });

    document.querySelector("#saveDictionaryButton").addEventListener("click", async () => {
        console.log("Save dictionary button clicked.");
        const dictionaryName = document.querySelector("#dictionaryName").value;
        const wordInputs = wordsContainer.querySelectorAll(".word-input");
        const words = [];

        wordInputs.forEach(input => {
            const word = input.querySelector("input:nth-child(1)").value;
            const translation = input.querySelector("input:nth-child(2)").value;
            const example = input.querySelector("input:nth-child(3)").value;
            if (word && translation) {
                words.push({ Text: word, Translation: translation, Example: example });
            }
        });

        if (!dictionaryName || words.length === 0) {
            alert("Please enter a dictionary name and at least one word.");
            return;
        }

        const dictionaryData = { Name: dictionaryName };

        const newDictionary = await api.createDictionary(dictionaryData);
        if (newDictionary) {
            const dictionaryId = newDictionary.DictionaryId;

            for (const word of words) {
                await api.addWord({ ...word, DictionaryId: dictionaryId });
            }

            alert("Dictionary created successfully.");
            const createDictionaryModal = bootstrap.Modal.getInstance(document.getElementById('createDictionaryModal'));
            createDictionaryModal.hide();
            await loadDictionaries(true); // Reload dictionaries
        } else {
            alert("Error creating dictionary.");
        }
    });

    $('#createDictionaryModal').on('hidden.bs.modal', function () {
        console.log("Dictionary modal hidden, clearing words container.");
        document.getElementById('wordsContainer').innerHTML = "<label>Words:</label>";
    });

    console.log("Dictionary modal setup complete.");
}
