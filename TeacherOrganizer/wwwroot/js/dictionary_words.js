import * as api from "./api_dictionary.js";

export async function loadDictionaryWords(wordsTableBody, dictionaryId)
{
    console.log(`Loading words for dictionary ${dictionaryId}...`);
    try
    {
        const dictionaryDetails = await api.getDictionaryById(dictionaryId);
        wordsTableBody.innerHTML = ""; // Очищаем перед добавлением

        if (dictionaryDetails.words && dictionaryDetails.words.length > 0)
        {
            console.log(`Words found for dictionary ${dictionaryId}.`);
            dictionaryDetails.words.forEach(word =>
            {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${word.text}</td>
                    <td>${word.translation}</td>
                    <td>${word.example || ""}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-danger delete-word" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn btn-sm btn-warning edit-word" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-primary speak-word" title="Speak word" data-text="${word.text}" data-lang="en">
                                Wrd
                            </button>
                            ${word.example ? `
                            <button class="btn btn-sm btn-primary speak-word" title="Speak example" data-text="${word.example}" data-lang="en">
                                Exp
                            </button>
                            ` : ''}
                        </div>
                    </td>
                `;
                wordsTableBody.appendChild(row);

                // Подключаем события для кнопок
                row.querySelector(".delete-word").addEventListener("click", () => deleteWord(dictionaryId, word.text));
                row.querySelector(".edit-word").addEventListener("click", () => editWord(dictionaryId, word));

                // Добавляем обработчики для всех кнопок озвучивания
                row.querySelectorAll(".speak-word").forEach(button =>
                {
                    button.addEventListener("click", function ()
                    {
                        const text = this.getAttribute("data-text");
                        const lang = this.getAttribute("data-lang");
                        speakWord(text, lang);
                    });
                });
            });
            console.log(`Words loaded for dictionary ${dictionaryId}.`);
        } else
        {
            console.log(`No words found for dictionary ${dictionaryId}.`);
            wordsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">This dictionary contains no words.</td></tr>';
        }
    } catch (error)
    {
        console.error(`Error loading dictionary details for dictionary ${dictionaryId}:`, error);
        wordsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading words.</td></tr>';
    }
}

// Функция удаления слова
async function deleteWord(dictionaryId, wordText)
{
    alert(`Deleting word: ${wordText}`);
}

// Функция редактирования (пока просто алерт)
function editWord(dictionaryId, word)
{
    alert(`Editing word: ${word.text}`);
}

// Функция озвучивания слова с использованием Web Speech API
function speakWord(text, lang = "en")
{
    if ('speechSynthesis' in window)
    {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    } else
    {
        console.error("Speech synthesis not supported in this browser");
        alert("Speech synthesis not supported in your browser");
    }
}