import * as api from "./api_dictionary.js";

export async function loadDictionaryWords(contentDiv, dictionaryId) {
    console.log(`Loading words for dictionary ${dictionaryId}...`);
    contentDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';

    try {
        const dictionaryDetails = await api.getDictionaryById(dictionaryId);

        if (dictionaryDetails.words && dictionaryDetails.words.length > 0) {
            console.log(`Words found for dictionary ${dictionaryId}.`);
            const wordsList = document.createElement("div");
            wordsList.classList.add("mt-3");

            dictionaryDetails.words.forEach(word => {
                const wordElement = document.createElement("div");
                wordElement.classList.add("word-item");
                wordElement.innerHTML = `<strong>${word.text}</strong> - ${word.translation} ${word.example ? `- ${word.example}` : ''}`;
                wordsList.appendChild(wordElement);
            });

            contentDiv.innerHTML = '';
            contentDiv.appendChild(wordsList);
            console.log(`Words loaded for dictionary ${dictionaryId}.`);
        } else {
            console.log(`No words found for dictionary ${dictionaryId}.`);
            contentDiv.innerHTML = '<p class="mt-3">This dictionary contains no words.</p>';
        }
    } catch (error) {
        console.error(`Error loading dictionary details for dictionary ${dictionaryId}:`, error);
        contentDiv.innerHTML = '<p class="text-danger mt-3">Error loading dictionary details.</p>';
    }
}