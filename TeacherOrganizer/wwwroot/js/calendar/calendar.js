// File: TeacherOrganizer/wwwroot/js/calendar/calendar.js

import { fetchLessons, createLesson, fetchLessonById, updateLesson, deleteLesson } from "../api/api_lessons.js";
import { fetchStudents } from "../api/api_user.js";
import { rescheduleLesson } from "../api/api_reschedule.js";

let calendar = null;
let modal = null;
let dateStart = null;
let dateEnd = null;
let currentLessonId = null;
let modalDetails = null;
const currentUserRole = window.currentUserRole;
export function initializeCalendar(contentPlaceholder) {
    contentPlaceholder.innerHTML = `<div id="calendar"></div>`;
    console.log("📅 Initializing calendar...");
    const filterHtml = `
<div class="filter-container mt-3 mb-2">
    <label for="statusFilter" class="me-2">Filter by status:</label>
    <select id="statusFilter" class="form-select" style="width: 200px;">
        <option value="all">All</option>
        <option value="Scheduled">Sheduled</option>
        <option value="Canceled">Cancelled</option>
        <option value="RescheduledRequest">Reschedule requested</option>
    </select>
`;
    contentPlaceholder.insertAdjacentHTML("beforeend", filterHtml);


    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
        console.error("❌ Calendar element not found!");
        return;
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        eventClick: function (info) {
            console.log("📌 Event clicked:", info.event);
            console.log("ℹ️ Event ID:", info.event.id);
            openLessonDetailsModal(info.event.id);
        },
        dateClick: function (info) {
            openLessonModal(info.dateStr);
        },
        datesSet: function (info) {
            console.log("📅 Date range changed:", info.start, info.end);

            if (!info.start || !info.end) {
                console.error("❌ Invalid date range:", info.start, info.end);
                return;
            }
            dateStart = new Date(info.start);
            dateEnd = new Date(info.end);
            updateCalendarEvents(new Date(info.start), new Date(info.end));
        }

    });

    calendar.render();
    document.getElementById("statusFilter").addEventListener("change", () => {
        updateCalendarEvents(dateStart, dateEnd);
    });

    loadModal();
    loadStudentsList();
    loadModalDetails();
}

const formatDateForApi = (date) => {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0") + "T" +
        String(date.getHours()).padStart(2, "0") + ":" +
        String(date.getMinutes()).padStart(2, "0") + ":" +
        String(date.getSeconds()).padStart(2, "0");
};

async function updateCalendarEvents(start, end) {
    try {
        const formattedStart = start.toISOString().split(".")[0];
        const formattedEnd = end.toISOString().split(".")[0];

        // Сначала получаем все события
        const events = await fetchLessons(formattedStart, formattedEnd);
        console.log("📥 Received events:", events);

        // Получаем выбранный статус
        const selectedStatus = document.getElementById("statusFilter")?.value || "all";

        // Фильтруем, если выбран конкретный статус
        let filtered = events;
        if (selectedStatus !== "all") {
            filtered = events.filter(ev => ev.status === selectedStatus);
        }

        // Назначаем цвета по статусу
        const coloredEvents = filtered.map(ev => {
            let color = "#3788d8"; // Scheduled

            if (ev.status === "Canceled" || ev.status === 1) {
                color = "#dc3545"; // отменён
            } else if (ev.status === "Completed" || ev.status === 2) {
                color = "#00ff00"; // перенос
            } else if (ev.status === "RescheduledRequest" || ev.status === 3) {
                color = "#ffc107"; // перенос
            }

            return {
                ...ev,
                backgroundColor: color,
                borderColor: color,
                textColor: "#fff"
            };
        });

        // Очищаем старые события и добавляем новые
        calendar.getEvents().forEach(event => event.remove());
        calendar.addEventSource(coloredEvents);

    } catch (error) {
        console.error("❌ Error fetching events:", error);
    }
}


async function loadModal() {
    try {
        const response = await fetch("/modals/lesson-modal.html");
        if (!response.ok) throw new Error("Failed to load modal template");

        const modalHtml = await response.text();
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        const modalEl = document.getElementById("lessonModal");
        if (!modalEl) {
            console.error("❌ Modal element not found!");
            return null;
        }

        modal = new bootstrap.Modal(modalEl);

        modalEl.addEventListener("shown.bs.modal", function () {
            $('#studentsSelect').select2({
                dropdownParent: $('#lessonModal')
            });
        });

        document.getElementById("saveLesson").addEventListener("click", saveLesson);

        return modal;
    } catch (error) {
        console.error("❌ Error loading modal:", error);
        return null;
    }
}

function openLessonModal(date) {
    if (!modal) return;

    console.log("📅 Opening modal for:", date);
    document.getElementById("lessonDate").value = date;
    document.getElementById("lessonStartTime").value = "";
    document.getElementById("lessonEndTime").value = "";
    document.getElementById("lessonDescription").value = "";
    modal.show();
}

async function loadStudentsList() {
    let students = await fetchStudents();
    let studentsSelect = $('#studentsSelect');
    studentsSelect.empty();

    students.forEach(student => {
        let option = new Option(student.userName, student.id, false, false);
        studentsSelect.append(option);
    });

    console.log("👥 Loaded students:", studentsSelect);

    $(document).ready(function () {
        if ($.fn.select2) {
            setTimeout(() => {
                $('#studentsSelect').select2();
            }, 500);
        } else {
            console.error("❌ Select2 не завантажено!");
        }
    });
}

async function saveLesson() {
    let selectedStudents = $('#studentsSelect').val();

    let lessonData = {
        description: document.getElementById("lessonDescription").value,
        startTime: document.getElementById("lessonDate").value + "T" + document.getElementById("lessonStartTime").value,
        endTime: document.getElementById("lessonDate").value + "T" + document.getElementById("lessonEndTime").value,
        studentIds: selectedStudents
    };

    console.log("📤 Sending data:", lessonData);
    try {
        let newLesson = await createLesson(lessonData);
        console.log("✅ Lesson added:", newLesson);

        alert("✅ Lesson added");

        modal.hide();
        updateCalendarEvents(dateStart, dateEnd);

    } catch (error) {
        alert(error.message || "Failed to save lesson");
    }
}

async function loadModalDetails() {
    try {
        const response = await fetch("/modals/lesson-details-modal.html");
        if (!response.ok) throw new Error("Failed to load modal details template");

        const modalHtml = await response.text();
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        const modalEl = document.getElementById("lessonDetailsModal");
        if (!modalEl) {
            console.error("❌ Modal details element not found!");
            return null;
        }

        modalDetails = new bootstrap.Modal(modalEl);

        let previouslyFocusedElement = null; // Store the element that had focus before the modal

        modalEl.addEventListener("shown.bs.modal", () => {
            previouslyFocusedElement = document.activeElement; // Save the currently focused element

            // Focus on the first focusable element within the modal (adjust as needed)
            const firstFocusableElement = modalEl.querySelector("button:not([disabled])"); // Example: first enabled button
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }

            modalEl.removeAttribute("aria-hidden"); // Ensure modal is not hidden when shown

            const actionSelect = document.getElementById("actionSelect");
            actionSelect.addEventListener("change", handleActionChange);

            document.getElementById("saveChangesBtn").addEventListener("click", () => {
                const selectedAction = actionSelect.value;
                if (selectedAction === "update") {
                    saveLessonDetails();
                } else if (selectedAction === "reschedule") {
                    rescheduleCurrentLesson();
                }
            });

            document.getElementById("deleteLessonBtn").addEventListener("click", deleteCurrentLesson);
        });

        modalEl.addEventListener("hidden.bs.modal", () => {
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus(); // Restore focus to the original element
            }
            modalEl.setAttribute("aria-hidden", "true"); // Hide the modal from assistive tech
        });

        return modalDetails;
    } catch (error) {
        console.error("❌ Error loading modal details:", error);
        return null;
    }
}
async function openLessonDetailsModal(lessonId) {
    if (!lessonId) {
        console.error("❌ lessonId is undefined or null");
        return;
    }
    console.log(`ℹ️ Fetching lesson with ID: ${lessonId}`);

    try {
        currentLessonId = lessonId;
        const lesson = await fetchLessonById(lessonId);
        if (!lesson) {
            alert("Lesson not found");
            return;
        }

        // Устанавливаем значения в существующие поля
        document.getElementById("detailLessonDate").value = lesson.startTime.split("T")[0];
        document.getElementById("detailLessonStartTime").value = lesson.startTime.split("T")[1].substring(0, 5);
        document.getElementById("detailLessonEndTime").value = lesson.endTime.split("T")[1].substring(0, 5);
        document.getElementById("detailLessonDescription").value = lesson.description;

        const actionSelect = document.getElementById("actionSelect");
        actionSelect.value = "none"; // Скидываем выбор
        handleActionChange(); // Обновляем интерфейс

        modalDetails.show();
    } catch (error) {
        console.error("❌ Error fetching lesson details:", error);
        alert("Failed to load lesson details");
    }
}


function handleActionChange() {
    const actionSelect = document.getElementById("actionSelect").value;
    const updateFields = document.getElementById("updateFields");
    const rescheduleFields = document.getElementById("rescheduleFields");
    const deleteConfirmation = document.getElementById("deleteConfirmation");
    const saveChangesBtn = document.getElementById("saveChangesBtn");
    const deleteLessonBtn = document.getElementById("deleteLessonBtn");

    updateFields.style.display = "none";
    rescheduleFields.style.display = "none";
    deleteConfirmation.style.display = "none";
    saveChangesBtn.style.display = "none";
    deleteLessonBtn.style.display = "none";

    if (actionSelect === "update") {
        updateFields.style.display = "block";
        saveChangesBtn.style.display = "inline-block";
    } else if (actionSelect === "reschedule") {
        rescheduleFields.style.display = "block";
        saveChangesBtn.style.display = "inline-block";
    } else if (actionSelect === "delete") {
        deleteConfirmation.style.display = "block";
        deleteLessonBtn.style.display = "inline-block";
    }
}


async function saveLessonDetails() {
    console.log(`🔄 Updating lesson with ID: ${currentLessonId}`);
    try {
        const updatedLessonData = {
            startTime: document.getElementById("updateLessonDate").value + "T" + document.getElementById("updateLessonStartTime").value,
            endTime: document.getElementById("updateLessonDate").value + "T" + document.getElementById("updateLessonEndTime").value,
            description: document.getElementById("updateLessonDescription").value,
        };

        let updatedLesson = await updateLesson(currentLessonId, updatedLessonData);
        console.log("✅ Lesson updated:", updatedLesson);
        modalDetails.hide();
        updateCalendarEvents(dateStart, dateEnd);
    } catch (error) {
        alert(error.message || "Failed to update lesson");
    }
}

async function deleteCurrentLesson() {
    console.log(`🗑️ Deleting lesson with ID: ${currentLessonId}`);
    try {
        await deleteLesson(currentLessonId);
        console.log("✅ Lesson deleted");
        modalDetails.hide();
        updateCalendarEvents(dateStart, dateEnd);
    } catch (error) {
        alert(error.message || "Failed to delete lesson");
    }
}

async function rescheduleCurrentLesson() {
    console.log(`🔄 Rescheduling lesson with ID: ${currentLessonId}`);
    try {
        const rescheduleData = {
            proposedStartTime: document.getElementById("rescheduleLessonDate").value + "T" + document.getElementById("rescheduleLessonStartTime").value,
            proposedEndTime: document.getElementById("rescheduleLessonDate").value + "T" + document.getElementById("rescheduleLessonEndTime").value,
        };

        //  Використовуємо оновлену функцію з api_lessons.js
        let rescheduledLesson = await rescheduleLesson(currentLessonId, rescheduleData);
        console.log("✅ Lesson reschedule proposed: ", rescheduledLesson); //  Змінено повідомлення
        modalDetails.hide();
        updateCalendarEvents(dateStart, dateEnd);
    } catch (error) {
        alert(error.message || "Failed to propose reschedule"); //  Змінено повідомлення
    }
}
