export async function fetchLessons() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString(); 
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(); 

    try {
        let response = await fetch(`/api/Lesson/Calendar?start=${start}&end=${end}`);
        if (!response.ok) throw new Error("Failed to fetch lessons");
        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching lessons:", error);
        return;
    }
}

export async function fetchStudents() {
    try {
        let response = await fetch("/api/Users/Students");
        if (!response.ok) throw new Error("Failed to fetch students");
        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching students:", error);
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