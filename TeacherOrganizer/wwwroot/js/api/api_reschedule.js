// api_reschedule.js

export async function rescheduleLesson(lessonId, rescheduleData) {
    try {
        const response = await fetch(`/api/Reschedule/Propose`, { //  Змінено URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId: lessonId, ...rescheduleData }), //  Змінено тіло запиту
        });
        if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.message || "Failed to propose reschedule"); //  Змінено повідомлення про помилку
        }
        return await response.json();
    } catch (error) {
        console.error("Error proposing reschedule:", error); //  Змінено повідомлення про помилку
        throw error;
    }
}
export async function fetchPendingRescheduleRequests() {
    try {
        const response = await fetch("/api/Reschedule/Pending");
        if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch pending reschedule requests");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching pending reschedule requests:", error);
        throw error;
    }
}

//  Функція для оновлення статусу запиту
export async function updateRescheduleRequestStatus(requestId, newStatus) {
    try {
        const response = await fetch(`/api/Reschedule/${requestId}/UpdateStatus`, {
            method: "POST", //  Або PUT, залежно від вашого API
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newStatus: newStatus }),
        });
        if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.message || "Failed to update reschedule request status");
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating reschedule request status:", error);
        throw error;
    }
}

export async function updateRescheduleRequest(requestId, updateData) {
    try {
        const response = await fetch(`/api/Reschedule/${requestId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
        });
        if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.message || "Failed to update reschedule request");
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating reschedule request:", error);
        throw error;
    }
}