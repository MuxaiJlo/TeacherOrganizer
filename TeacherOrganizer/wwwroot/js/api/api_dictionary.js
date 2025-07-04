﻿export async function getDictionaries()
{
    try
    {
        const response = await fetch("/api/Dictionary");
        if (!response.ok) throw new Error("Failed to fetch dictionaries");
        return await response.json();
    } catch (error)
    {
        console.error("Error fetching dictionaries:", error);
        return [];
    }
}
export async function getDictionariesAll()
{
    try
    {
        const response = await fetch("/api/Dictionary/All");
        if (!response.ok) throw new Error("Failed to fetch dictionaries");
        return await response.json();
    } catch (error)
    {
        console.error("Error fetching dictionaries:", error);
        return [];
    }
}

export async function getDictionaryById(dictionaryId)
{
    try
    {
        const response = await fetch(`/api/Dictionary/${dictionaryId}`);
        if (!response.ok) throw new Error("Failed to fetch dictionary");
        return await response.json();
    } catch (error)
    {
        console.error("Error fetching dictionary:", error);
        return null;
    }
}
export async function getWordsByDictionaryId(dictionaryId)
{
    try
    {
        const response = await fetch(`/api/Dictionary/${dictionaryId}`);
        if (!response.ok) throw new Error("Failed to fetch words");

        const dictionary = await response.json();
        return dictionary.words; // Возвращаем только список слов
    } catch (error)
    {
        console.error("❌ Error fetching words:", error);
        return [];
    }
}


export async function createDictionary(dictionaryData)
{
    try
    {
        const response = await fetch("/api/Dictionary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dictionaryData),
        });

        if (!response.ok) throw new Error("Failed to create dictionary");
        return await response.json();
    } catch (error)
    {
        console.error("Error creating dictionary:", error);
        return null;
    }
}

export async function copyDictionary(dictionaryId)
{
    try
    {
        const response = await fetch(`/api/Dictionary/${dictionaryId}/Copy`, {
            method: "POST",
        });

        if (!response.ok) throw new Error("Failed to copy dictionary");
        return await response.json();
    } catch (error)
    {
        console.error("Error copying dictionary:", error);
        return null;
    }
}

export async function addWord(wordData)
{
    try
    {
        const response = await fetch("/api/Word", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(wordData),
        });

        if (!response.ok) throw new Error("Failed to add word");
        return await response.json();
    } catch (error)
    {
        console.error("Error adding word:", error);
        return null;
    }
}
export async function deleteDictionary(dictionaryId)
{
    const response = await fetch(`/api/Dictionary/${dictionaryId}`, {
        method: "DELETE",
    });
    return response;
}

export async function updateDictionary(dictionaryId, model)
{
    const response = await fetch(`/api/Dictionary/${dictionaryId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(model),
    });
    if (response.ok)
    {
        const dictionary = await response.json();
        console.log(`Dictionary ${dictionaryId} updated.`);
        return dictionary;
    } else
    {
        console.error(`Error updating dictionary ${dictionaryId}.`);
    }
}
export async function updateWord(wordId, wordData) {
    try {
        const response = await fetch(`/api/Word/${wordId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(wordData),
        });

        if (!response.ok) throw new Error("Failed to update word");
        return await response.json();
    } catch (error) {
        console.error("Error updating word:", error);
        return null;
    }
}

export async function deleteWord(wordId, dictionaryId) {
    try {
        const response = await fetch(`/api/Word/${wordId}/Dictionary/${dictionaryId}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete word");
        return true;
    } catch (error) {
        console.error("Error deleting word:", error);
        return false;
    }
}
