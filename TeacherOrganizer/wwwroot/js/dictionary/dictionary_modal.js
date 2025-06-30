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
            alert("First of all create dictionary!");
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
    const createDictionaryButtonModal = document.querySelector("#createDictionaryButtonModal");

    if (wordsContainerElement) {
        // Очищаем контейнер и добавляем один пустой блок для ввода слова
        wordsContainerElement.innerHTML = `
            <label>Words:</label>
            <div class="word-input d-flex align-items-center mb-2">
                <input type="text" class="form-control flex-grow-1" placeholder="Word">
                <input type="text" class="form-control flex-grow-1" placeholder="Translation">
                <input type="text" class="form-control flex-grow-1" placeholder="Example">
                <button class="btn remove-word border-0 bg-transparent text-danger p-0"
                        style="font-size: 1.5em; line-height: 1;" onmouseover="this.style.color='red';"
                        onmouseout="this.style.color='black';">
                    -
                </button>
            </div>
        `;
    }

    if (dictionaryNameInput) {
        dictionaryNameInput.value = ""; // Очищаем поле имени словаря
        dictionaryNameInput.disabled = false;
        dictionaryNameInput.removeAttribute("data-dictionaryId");
    }

    if (createDictionaryButtonModal) {
        createDictionaryButtonModal.disabled = false;
    }

    // Повторно навешиваем обработчик на кнопку "добавить слово"
    const addWordButton = document.querySelector("#addWordButton");
    if (addWordButton) {
        addWordButton.onclick = () => {
            const wordsContainer = document.getElementById("wordsContainer");
            const wordInputTemplate = wordsContainer.querySelector(".word-input").cloneNode(true);

            wordInputTemplate.querySelectorAll("input").forEach(input => {
                input.value = "";
            });

            wordsContainer.appendChild(wordInputTemplate);

            wordInputTemplate.querySelector(".remove-word").addEventListener("click", () => {
                wordInputTemplate.remove();
            });
        };
    }
});

    console.log("Dictionary modal setup complete.");
}