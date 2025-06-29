﻿// dictionary_words.js

import * as api from "../api/api_dictionary.js";
import { getUserById } from "../api/api_user.js";
export async function loadDictionaryWords(wordsTableBody, dictionaryId) {
    console.log(`Loading words for dictionary ${dictionaryId}...`);
    try {
        const dictionaryDetails = await api.getDictionaryById(dictionaryId);
        wordsTableBody.innerHTML = ""; // Очищаем перед добавлением

        if (dictionaryDetails.words && dictionaryDetails.words.length > 0) {
            console.log(`Words found for dictionary ${dictionaryId}.`);
            dictionaryDetails.words.forEach(word => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td contenteditable="false" class="word-text">${word.text}</td>
                    <td contenteditable="false" class="word-translation">${word.translation}</td>
                    <td contenteditable="false" class="word-example">${word.example || ""}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-danger delete-word" title="Delete">
                                <img src="../icons/delete.png" alt="Delete" class="action-button-icon">
                            </button>
                            <button class="btn btn-sm btn-warning edit-word" title="Edit">
                                <img src="../icons/edit.png" alt="Edit" class="action-button-icon">
                            </button>
                            <button class="btn btn-sm btn-primary speak-word" title="Speak word" data-text="${word.text}" data-lang="en">
                                <img src="../icons/volume-up.png" alt="Speak word" class="speak-button-icon">
                            </button>
                            ${word.example ? `
                            <button class="btn btn-sm btn-primary speak-word" title="Speak example" data-text="${word.example}" data-lang="en">
                                <img src="../icons/volume-up.png" alt="Speak example" class="speak-button-icon">
                            </button>
                            ` : ''}
                        </div>
                    </td>
                `;
                wordsTableBody.appendChild(row);

                // Подключаем события для кнопок
                row.querySelector(".delete-word").addEventListener("click", () => deleteWord(word.wordId, row, dictionaryId));
                row.querySelector(".edit-word").addEventListener("click", () => editWord(word.wordId, row, dictionaryId));

                // Добавляем обработчики для всех кнопок озвучивания
                row.querySelectorAll(".speak-word").forEach(button => {
                    button.addEventListener("click", function () {
                        const text = this.getAttribute("data-text");
                        const lang = this.getAttribute("data-lang");
                        speakWord(text, lang);
                    });
                });
            });
            console.log(`Words loaded for dictionary ${dictionaryId}.`);
        } else {
            console.log(`No words found for dictionary ${dictionaryId}.`);
            wordsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">This dictionary contains no words.</td></tr>';
        }
    } catch (error) {
        console.error(`Error loading dictionary details for dictionary ${dictionaryId}:`, error);
        wordsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading words.</td></tr>';
    }
}

async function deleteWord(wordId, row, dictionaryId) {
    if (confirm("Are you sure you want to delete this word?")) {
        const success = await api.deleteWord(wordId, dictionaryId);
        if (success) {
            row.remove();
            console.log(`Word ${wordId} deleted for Dictionary ${dictionaryId}.`);
        } else {
            console.error(`Error deleting word ${wordId}.`);
        }
    }
}

function editWord(wordId, row, dictionaryId) {
    const editButton = row.querySelector(".edit-word");
    const isEditing = editButton.querySelector("img").getAttribute("src") === "../icons/save.png";

    if (isEditing) {
        saveWord(wordId, row, dictionaryId);
        editButton.innerHTML = '<img src="../icons/edit.png" alt="Edit" class="action-button-icon">';
        row.querySelectorAll("td[contenteditable]").forEach(cell => cell.setAttribute("contenteditable", "false"));
    } else {
        editButton.innerHTML = '<img src="../icons/save.png" alt="Save" class="action-button-icon">';
        row.querySelectorAll("td[contenteditable]").forEach(cell => cell.setAttribute("contenteditable", "true"));
    }
}

async function saveWord(wordId, row, dictionaryId) {
    const wordText = row.querySelector(".word-text").innerText.trim();
    const wordTranslation = row.querySelector(".word-translation").innerText.trim();
    const wordExample = row.querySelector(".word-example").innerText.trim();

    if (!wordText || wordText.length > 100) {
        alert("Word is required and must be less than 100 characters.");
        return;
    }

    if (!wordTranslation || wordTranslation.length > 100) {
        alert("Translation is required and must be less than 100 characters.");
        return;
    }

    if (wordExample && wordExample.length > 250) {
        alert("Example must be less than 250 characters.");
        return;
    }

    const wordData = {
        dictionaryId: dictionaryId,
        text: wordText,
        translation: wordTranslation,
        example: wordExample
    };

    try {
        const updatedWord = await api.updateWord(wordId, wordData);
        if (updatedWord) {
            console.log(`Word ${wordId} updated.`);
            alert("Word updated successfully.");
        } else {
            console.error(`Error updating word ${wordId}.`);
            alert("Failed to update word. Please try again.");
        }
    } catch (error) {
        console.error(`Error while saving word ${wordId}:`, error);
        alert("An error occurred while updating the word.");
    }
}

function speakWord(text, lang = "en") {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    } else {
        console.error("Speech synthesis not supported in this browser");
        alert("Speech synthesis not supported in your browser");
    }
}