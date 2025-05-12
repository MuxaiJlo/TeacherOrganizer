// File: TeacherOrganizer/wwwroot/js/calendar/calendar-events.js
import { fetchLessons } from "../api/api_lessons.js";
import { getActiveFilters } from "./calendar.js";

// Функції роботи з подіями календаря
export async function updateCalendarEvents(calendar, start, end) {
    try {
        // Создаем копии дат, чтобы не изменять оригиналы
        const startCopy = new Date(start);
        const endCopy = new Date(end);
        // Устанавливаем время в полночь в локальном часовом поясе
        startCopy.setHours(0, 0, 0, 0);
        endCopy.setHours(0, 0, 0, 0);
        // Форматируем даты с учетом часового пояса
        const formattedStart = formatDateWithTimezone(startCopy);
        const formattedEnd = formatDateWithTimezone(endCopy);
        console.log("🛜 Actual API request dates:", formattedStart, formattedEnd);
        // Отримуємо всі події
        const events = await fetchLessons(formattedStart, formattedEnd);
        console.log("📥 Received events:", events);
        // Фільтруємо події
        const filteredEvents = filterEvents(events);
        // Очищаємо старі події та додаємо нові
        calendar.getEvents().forEach(event => event.remove());
        calendar.addEventSource(filteredEvents);
    } catch (error) {
        console.error("❌ Error fetching events:", error);
    }
}

// Функция для форматирования даты с учетом часового пояса
function formatDateWithTimezone(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Combined filter function that handles both status and username filtering
export function filterEvents(events) {
    // Отримуємо активні фільтри
    const filters = getActiveFilters();
    const selectedStatus = filters.status;
    const searchUsername = filters.username.toLowerCase().trim();

    // Фільтруємо події за статусом та username
    let filtered = events;

    // Apply status filter if not "all"
    if (selectedStatus !== "all") {
        filtered = filtered.filter(ev => ev.status === selectedStatus);
    }

    // Apply username filter if provided
    if (searchUsername) {
        filtered = filtered.filter(ev => {
            // Check if username property exists and matches the filter
            // Adapt this condition based on your actual event data structure
            const username = (ev.userName || ev.studentUsername || ev.teacherUsername || "").toLowerCase();
            return username.includes(searchUsername);
        });
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