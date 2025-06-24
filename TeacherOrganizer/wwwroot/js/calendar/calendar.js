// File: TeacherOrganizer/wwwroot/js/calendar/calendar.js

import { fetchLessons } from "../api/api_lessons.js";
import { initLessonModal, openLessonModal } from "./calendar-modals.js";
import { initLessonDetailsModal, openLessonDetailsModal } from "./calendar-details.js";
import { updateCalendarEvents } from "./calendar-events.js";

// Global variables for the calendar
let calendar = null;
let dateStart = null;
let dateEnd = null;

export function initializeCalendar(contentPlaceholder) {
    contentPlaceholder.innerHTML = `<div id="calendar"></div>`;
    console.log("📅 Initializing calendar...");

    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
        console.error("❌ Calendar element not found!");
        return;
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: 'auto',
        contentHeight: 'auto',
        expandRows: true, // Розтягує рядки під контент
        aspectRatio: 1.8, // Зробити календар ширше
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        customButtons: {
            filters: {
                text: 'Filters',
                click: function () {
                    // Це все ще може бути використано для чогось іншого, якщо потрібно
                }
            }
        },
        eventDisplay: 'block',
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
        },
        dayMaxEventRows: true,
        views: {
            dayGridMonth: {
                dayMaxEventRows: 5 
            }
        },
        eventClick: function (info) {
            console.log("📌 Event clicked:", info.event);
            openLessonDetailsModal(info.event.id);
        },
        dateClick: function (info) {
            if (currentUserRole === "Teacher") {
                openLessonModal(info.dateStr);
            } else {
                alert("You don't have permission to create lessons.");
            }
        },
        datesSet: function (info) {
            console.log("📅 Date range changed:", info.start, info.end);
            if (!info.start || !info.end) {
                console.error("❌ Invalid date range:", info.start, info.end);
                return;
            }
            dateStart = new Date(info.start);
            dateEnd = new Date(info.end);
            updateCalendarEvents(calendar, new Date(info.start), new Date(info.end));
        }
    });
    window.calendar = calendar; // Сделать доступным глобально
    calendar.render();

    // Завантажуємо та вставляємо форму фільтрів
    fetch('/modals/calendary.html')
        .then(response => response.text())
        .then(filterHtml => {
            // Найдем хедер и контейнер вида календаря
            const headerElement = calendar.el.querySelector('.fc-header-toolbar');
            const viewHarness = calendar.el.querySelector('.fc-view-harness');

            if (headerElement && viewHarness) {
                // Создаем контейнер для фильтров
                const filterContainer = document.createElement('div');
                filterContainer.innerHTML = filterHtml;

                // Вставляем фильтры между шапкой и ячейками календаря
                headerElement.parentNode.insertBefore(filterContainer, viewHarness);

                // Подключаем обработчики фильтров
                document.getElementById("statusFilter").addEventListener("change", () => {
                    updateCalendarEvents(calendar, dateStart, dateEnd);
                });

                document.getElementById("usernameFilter").addEventListener("input", () => {
                    updateCalendarEvents(calendar, dateStart, dateEnd);
                });
            }
        })
        .catch(error => {
            console.error('Failed to load filter form:', error);
        });

       
    // Initialize modals
    initLessonModal();
    initLessonDetailsModal();

    // Add a small resize handler to improve responsiveness
    window.addEventListener('resize', () => {
        setTimeout(() => calendar.updateSize(), 200);
    });
}

// Export functions to get the current calendar state
export function getCurrentDateRange() {
    return { start: dateStart, end: dateEnd };
}

export function getCalendarInstance() {
    return calendar;
}

export function getActiveFilters() {
    return {
        status: document.getElementById("statusFilter")?.value || "all",
        username: document.getElementById("usernameFilter")?.value || ""
    };
}