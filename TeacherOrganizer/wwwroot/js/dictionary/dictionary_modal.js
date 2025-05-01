// dictionary_modal.js

import * as api from "../api/api_dictionary.js";
import { loadDictionaries } from "./dictionary.js";
import { getUserById } from "../api/api_user.js";
export function setupDictionaryModal() {
    console.log("Setting up dictionary modal...");
    let currentDictionaryId = null;

    const createDictionaryButton = document.querySelector("#createDictionaryButton");
    const addWordButton = document.querySelector("#addWordButton");
    const createDictionaryButtonModal = document.querySelector("#createDictionaryButtonModal");
    const addWordsToDictionaryButton = document.querySelector("#AddWordsToDictionaryButton");
    const wordsContainer = document.getElementById("wordsContainer");
    const dictionaryNameInput = document.querySelector("#dictionaryName");

    if (createDictionaryButton) {
        createDictionaryButton.addEventListener("click", () => {
            console.log("Create dictionary button clicked.");
            const createDictionaryModal = new bootstrap.Modal(document.getElementById('createDictionaryModal'));
            createDictionaryModal.show();
        });
    }

    if (addWordButton) {
        addWordButton.addEventListener("click", () => {
            console.log("Add word button clicked.");
            const wordInputTemplate = wordsContainer.querySelector(".word-input").cloneNode(true);

            wordInputTemplate.querySelectorAll("input").forEach(input => {
                input.value = "";
            });

            wordsContainer.appendChild(wordInputTemplate);

            wordInputTemplate.querySelector(".remove-word").addEventListener("click", () => {
                console.log("Remove word button clicked.");
                wordInputTemplate.remove();
            });
        });
    }

    if (createDictionaryButtonModal) {
        createDictionaryButtonModal.addEventListener("click", async () => {
            const dictionaryName = dictionaryNameInput.value.trim();

            if (!dictionaryName) {
                alert("Please enter a name for your dictionary.");
                return;
            }

            if (dictionaryName.length < 3 || dictionaryName.length > 50) {
                alert("Dictionary name must be between 3 and 50 characters.");
                return;
            }

            try {
                const newDictionary = await api.createDictionary({ Name: dictionaryName });

                if (newDictionary) {
                    currentDictionaryId = newDictionary.dictionaryId;
                    alert("Dictionary created successfully. Now you can add words.");
                    dictionaryNameInput.disabled = true;
                    createDictionaryButtonModal.disabled = true;
                } else {
                    alert("Failed to create dictionary. Please try again.");
                }
            } catch (error) {
                console.error("Error creating dictionary:", error);
                alert("An error occurred while creating the dictionary. Please try again.");
            }
        });
    }

    if (addWordsToDictionaryButton) {
        addWordsToDictionaryButton.addEventListener("click", async () => {
            const dictionaryId = currentDictionaryId;

            const wordInputs = wordsContainer.querySelectorAll(".word-input");
            const words = [];

            wordInputs.forEach(input => {
                const word = input.querySelector("input:nth-child(1)").value.trim();
                const translation = input.querySelector("input:nth-child(2)").value.trim();
                const example = input.querySelector("input:nth-child(3)").value.trim();

                if (word && translation) {
                    words.push({ Text: word, Translation: translation, Example: example });
                }
            });

            if (!dictionaryId) {
                alert("Please create a dictionary before adding words.");
                return;
            }

            if (words.length === 0) {
                alert("Please enter at least one word with its translation.");
                return;
            }

            try {
                for (const word of words) {
                    await api.addWord({ ...word, DictionaryId: dictionaryId });
                }
                alert("Words added successfully.");
            } catch (error) {
                console.error("Error adding words:", error);
                alert("An error occurred while adding words. Please try again.");
            }

            await loadDictionaries(true);
        });
    }

    // Add null checks for elements to prevent TypeError
    $('#createDictionaryModal').on('hidden.bs.modal', function () {
        console.log("Dictionary modal hidden, clearing words container.");

        const wordsContainerElement = document.getElementById('wordsContainer');
        const dictionaryNameInput = document.querySelector("#dictionaryName");
        const createAndAddWordsButton = document.querySelector("#createAndAddWordsButton");

        if (wordsContainerElement) {
            wordsContainerElement.innerHTML = "<label>Words:</label>";
        }

        if (dictionaryNameInput) {
            dictionaryNameInput.disabled = false;
            dictionaryNameInput.removeAttribute("data-dictionaryId");
        }

        if (createAndAddWordsButton) {
            createAndAddWordsButton.disabled = false;
        }
    });

    console.log("Dictionary modal setup complete.");
}