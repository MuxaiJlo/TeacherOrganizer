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
            console.log("Create dictionary button clicked.");
            const dictionaryName = dictionaryNameInput.value;

            if (!dictionaryName) {
                alert("Please enter a dictionary name.");
                return;
            }

            const dictionaryData = { Name: dictionaryName };

            try {
                const newDictionary = await api.createDictionary(dictionaryData);

                if (newDictionary) {
                    currentDictionaryId = newDictionary.dictionaryId;
                    console.log("Dictionary ID CURRENT: ", currentDictionaryId);

                    alert("Dictionary created. You can now add words.");
                    dictionaryNameInput.disabled = true;
                    createDictionaryButtonModal.disabled = true;
                } else {
                    alert("Error creating dictionary.");
                }
            } catch (error) {
                console.error("Error creating dictionary:", error);
                alert("An error occurred while creating the dictionary.");
            }
        });
    }

    if (addWordsToDictionaryButton) {
        addWordsToDictionaryButton.addEventListener("click", async () => {
            console.log("Save dictionary button clicked.");

            const createDictionaryModal = bootstrap.Modal.getInstance(document.getElementById('createDictionaryModal'));
            if (createDictionaryModal) {
                createDictionaryModal.hide();
            }

            // Use currentDictionaryId instead of dictionaryId
            const dictionaryId = currentDictionaryId;
            console.log("Dictionary ID save words btn: ", dictionaryId);

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

            if (dictionaryId && words.length > 0) {
                try {
                    for (const word of words) {
                        await api.addWord({ ...word, DictionaryId: dictionaryId });
                    }
                    alert("Words added to dictionary.");
                } catch (error) {
                    console.error("Error adding words:", error);
                    alert("An error occurred while adding words.");
                }
            } else {
                alert("No dictionary selected or no words to add.");
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