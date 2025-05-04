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

    // Add filter container
    addFilterContainer(contentPlaceholder);

    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
        console.error("❌ Calendar element not found!");
        return;
    }

    // Create calendar with improved configuration
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: 'auto', // Allows calendar to adjust height based on content
        aspectRatio: 1.35, // Better proportions for calendar
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        // Improved event display settings
        eventDisplay: 'block',
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
        },
        // Make text in cells more readable
        dayMaxEventRows: true,
        views: {
            dayGridMonth: {
                dayMaxEventRows: 3 // Limit number of events displayed per day
            }
        },
        eventClick: function (info) {
            console.log("📌 Event clicked:", info.event);
            openLessonDetailsModal(info.event.id);
        },
        dateClick: function (info) {
            // Only allow teachers to create lessons
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

    calendar.render();

    document.getElementById("statusFilter").addEventListener("change", () => {
        updateCalendarEvents(calendar, dateStart, dateEnd);
    });

    // Initialize modals
    initLessonModal();
    initLessonDetailsModal();

    // Add a small resize handler to improve responsiveness
    window.addEventListener('resize', () => {
        setTimeout(() => calendar.updateSize(), 200);
    });
}

// Improved filter container with better styling
function addFilterContainer(contentPlaceholder) {
    const filterHtml = `
    <div class="filter-container mt-3 mb-2">
        <label for="statusFilter" class="me-2">Filter by status:</label>
        <select id="statusFilter" class="form-select" style="width: 200px; max-width: 100%;">
            <option value="all">All</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Canceled">Cancelled</option>
            <option value="RescheduledRequest">Reschedule requested</option>
        </select>
    </div>`;

    contentPlaceholder.insertAdjacentHTML("beforeend", filterHtml);
}
// Export functions to get the current calendar state
export function getCurrentDateRange() {
    return { start: dateStart, end: dateEnd };
}

export function getCalendarInstance() {
    return calendar;
}