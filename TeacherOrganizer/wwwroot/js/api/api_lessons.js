
export async function fetchLessons(start, end) {
    if (!start || !end) {
        console.warn("⚠️ Skipping fetchLessons due to missing start or end");
        return [];
    }

    try {
        console.log("🛜 Fetching from API with start:", start, "end:", end);

        let response = await fetch(`/api/Lesson/Calendar?start=${start}&end=${end}`);
        
        if (!response.ok) {
            console.error("❌ API returned error:", response.status);
            throw new Error("Failed to fetch lessons");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching lessons:", error);
        return [];
    }
}

export async function createLesson(lessonData) {
    try {
        console.log("Fetching URL:", "/api/Lesson"); 
        console.log("Sending data to API:", lessonData);
        let response = await fetch("/api/Lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lessonData),
        });

        if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.message || "Failed to create lesson");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error creating lesson:", error);
        throw error;
    }
}

export async function fetchLessonById(lessonId) {
    try {
        const response = await fetch(`/api/Lesson/${lessonId}`);
        if (!response.ok) throw new Error("Failed to fetch lesson");
        return await response.json();
    } catch (error) {
        console.error("Error fetching lesson:", error);
        return null;
    }
}

export async function updateLesson(lessonId, lessonData) {
    try {
        console.log("Fetching URL:", "/api/Lesson", lessonId);
        console.log("Sending data to API:", lessonData);
        let response = await fetch(`/api/Lesson/${lessonId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lessonData),
        });
        if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.message || "Failed to update lesson");
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating lesson:", error);
        throw error;
    }
}

export async function deleteLesson(lessonId) {
    try {
        const response = await fetch(`/api/Lesson/${lessonId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete lesson");
        }
    } catch (error) {
        console.error("Error deleting lesson:", error);
        throw error;
    }
}

export const getScheduledLessons = async () => {
    try {
        const response = await fetch('/api/Lesson/scheduled');
        if (!response.ok) {
            const message = `Error HTTP: ${response.status}`;
            throw new Error(message);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error retrieving scheduled lessons:', error);
        throw error;
    }
};
