// dictionary_words.js

import * as api from "../api/api_dictionary.js";
let ttsReady = false;
let selectedVoice = [];
let voicesLoaded = false;

function speakWord(text, lang = "en") {
    console.log('speakWord called with:', text, lang);

    if (!('speechSynthesis' in window)) {
        console.error("Speech synthesis not supported");
        return;
    }

    // Если голоса еще не загружены, не озвучиваем
    if (!voicesLoaded || !selectedVoice) {
        console.warn('Voices not loaded yet, waiting...');
        // Пробуем повторить через 200мс, но только если не было попытки озвучить этот текст
        setTimeout(() => speakWord(text, lang), 200);
        return;
    }

    // Chrome: иногда помогает отменить все предыдущие utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.voice = selectedVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => console.log('✓ Speech STARTED');
    utterance.onend = () => console.log('✓ Speech ENDED');
    utterance.onerror = (e) => console.warn('✗ Speech ERROR:', e);

    console.log('Speaking...');
    window.speechSynthesis.speak(utterance);
}

function initializeTTS() {
    console.log('Initializing TTS...');

    if (!('speechSynthesis' in window)) {
        console.warn('Speech Synthesis API not supported');
        return;
    }

    const loadVoices = () => {
        const voices = speechSynthesis.getVoices().filter(v => v.lang.toLowerCase() === 'en-gb');
        console.log('Voices loaded:', voices.length);

        if (voices.length > 0) {
            voicesLoaded = true;
            selectedVoice = voices[0];
            voices.forEach((v, i) => console.log(`Voice ${i}: ${v.name} (${v.lang})`));
            return true;
        }
        return false;
    };

    if (!loadVoices()) {
        const voicesChangedHandler = () => {
            if (loadVoices()) {
                window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
                console.log('✓ TTS initialized successfully');
            }
        };
        window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
        // Chrome: вызов getVoices для инициализации
        window.speechSynthesis.getVoices();
    } else {
        console.log('✓ TTS initialized successfully');
    }
}


export async function loadDictionaryWords(wordsTableBody, dictionaryId) {
    console.log(`Loading words for dictionary ${dictionaryId}...`);

    // Инициализируем TTS при загрузке слов
    initializeTTS();

    try {
        const dictionaryDetails = await api.getDictionaryById(dictionaryId);
        wordsTableBody.innerHTML = "";

        const isOwner = window.currentUserId === dictionaryDetails.userId;
        const isTeacher = window.currentUserRole !== "Student";
        const canEditWords = isOwner || isTeacher;

        if (dictionaryDetails.words && dictionaryDetails.words.length > 0) {
            dictionaryDetails.words.forEach(word => {
                const row = document.createElement("tr");
                let actionsHtml = `
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-primary speak-word" title="Speak word" data-text="${word.text}" data-lang="en">
                        <img src="../icons/volume-up.png" alt="Speak word" class="speak-button-icon">
                    </button>
                    ${word.example ? `
                    <button class="btn btn-sm btn-primary speak-word" title="Speak example" data-text="${word.example}" data-lang="en">
                        <img src="../icons/volume-up.png" alt="Speak example" class="speak-button-icon">
                    </button>
                    ` : ''}
            `;

                if (canEditWords) {
                    actionsHtml += `
                    <button class="btn btn-sm btn-danger delete-word" title="Delete">
                        <img src="../icons/delete.png" alt="Delete" class="action-button-icon">
                    </button>
                    <button class="btn btn-sm btn-warning edit-word" title="Edit">
                        <img src="../icons/edit.png" alt="Edit" class="action-button-icon">
                    </button>
                `;
                }
                actionsHtml += `</div>`;

                row.innerHTML = `
                <td contenteditable="false" class="word-text">${word.text}</td>
                <td contenteditable="false" class="word-translation">${word.translation}</td>
                <td contenteditable="false" class="word-example">${word.example || ""}</td>
                <td>${actionsHtml}</td>
            `;
                wordsTableBody.appendChild(row);

                if (canEditWords) {
                    row.querySelector(".delete-word")?.addEventListener("click", () => deleteWord(word.wordId, row, dictionaryId));
                    row.querySelector(".edit-word")?.addEventListener("click", () => editWord(word.wordId, row, dictionaryId));
                }

                // События для кнопок озвучивания
                row.querySelectorAll(".speak-word").forEach(button => {
                    button.addEventListener("click", function (event) {
                        event.preventDefault();
                        const icon = this.querySelector('img');
                        const originalSrc = icon.src;

                        // Меняем иконку на "загрузка"
                        icon.src = '../icons/loading.png';

                        const text = this.getAttribute("data-text");
                        const lang = this.getAttribute("data-lang");

                        speakWord(text, lang);

                        // Возвращаем исходную иконку через 1 секунду
                        setTimeout(() => {
                            icon.src = originalSrc;
                        }, 1000);
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