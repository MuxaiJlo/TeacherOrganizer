export async function getDictionaries() {
    try {
        const response = await fetch("/api/Dictionary");
        if (!response.ok) throw new Error("Failed to fetch dictionaries");
        return await response.json();
    } catch (error) {
        console.error("Error fetching dictionaries:", error);
        return [];
    }
}

export async function getDictionaryById(dictionaryId) {
    try {
        const response = await fetch(`/api/Dictionary/${dictionaryId}`);
        if (!response.ok) throw new Error("Failed to fetch dictionary");
        return await response.json();
    } catch (error) {
        console.error("Error fetching dictionary:", error);
        return null;
    }
}

export async function createDictionary(dictionaryData) {
    try {
        const response = await fetch("/api/Dictionary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dictionaryData),
        });

        if (!response.ok) throw new Error("Failed to create dictionary");
        return await response.json();
    } catch (error) {
        console.error("Error creating dictionary:", error);
        return null;
    }
}

export async function copyDictionary(dictionaryId) {
    try {
        const response = await fetch(`/api/Dictionary/${dictionaryId}/Copy`, {
            method: "POST",
        });

        if (!response.ok) throw new Error("Failed to copy dictionary");
        return await response.json();
    } catch (error) {
        console.error("Error copying dictionary:", error);
        return null;
    }
}
