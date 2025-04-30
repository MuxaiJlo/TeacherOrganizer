// File: TeacherOrganizer/wwwroot/js/calendar/calendar-events.js

import { fetchLessons } from "../api/api_lessons.js";

// Функції роботи з подіями календаря
export async function updateCalendarEvents(calendar, start, end) {
    try {
        const formattedStart = start.toISOString().split(".")[0];
        const formattedEnd = end.toISOString().split(".")[0];

        // Отримуємо всі події
        const events = await fetchLessons(formattedStart, formattedEnd);
        console.log("📥 Received events:", events);

        // Фільтруємо події
        const filteredEvents = filterEventsByStatus(events);

        // Очищаємо старі події та додаємо нові
        calendar.getEvents().forEach(event => event.remove());
        calendar.addEventSource(filteredEvents);

    } catch (error) {
        console.error("❌ Error fetching events:", error);
    }
}

export function filterEventsByStatus(events) {
    // Отримуємо вибраний статус
    const selectedStatus = document.getElementById("statusFilter")?.value || "all";

    // Фільтруємо, якщо вибрано конкретний статус
    let filtered = events;
    if (selectedStatus !== "all") {
        filtered = events.filter(ev => ev.status === selectedStatus);
    }

    // Призначаємо кольори за статусом
    return filtered.map(ev => {
        let color = "#3788d8"; // Scheduled

        if (ev.status === "Canceled" || ev.status === 1) {
            color = "#dc3545"; // відмінено
        } else if (ev.status === "Completed" || ev.status === 2) {
            color = "#00ff00"; // виконано
        } else if (ev.status === "RescheduledRequest" || ev.status === 3) {
            color = "#ffc107"; // запит на перенесення
        }

        return {
            ...ev,
            backgroundColor: color,
            borderColor: color,
            textColor: "#fff"
        };
    });
}