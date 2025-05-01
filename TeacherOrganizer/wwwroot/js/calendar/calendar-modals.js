// File: TeacherOrganizer/wwwroot/js/calendar/calendar-modals.js

import { createLesson } from "../api/api_lessons.js";
import { fetchStudents } from "../api/api_user.js";
import { validateLessonData } from "./calendar-utils.js";
import { updateCalendarEvents } from "./calendar-events.js";
import { getCurrentDateRange, getCalendarInstance } from "./calendar.js";

// Змінні модуля
let modal = null;

export async function initLessonModal() {
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

        // Ініціалізація списку студентів
        loadStudentsList();

        return modal;
    } catch (error) {
        console.error("❌ Error loading modal:", error);
        return null;
    }
}

export function openLessonModal(date) {
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

// Функції для створення уроків
async function saveLesson() {
    try {
        const description = document.getElementById("lessonDescription").value;
        const lessonDate = document.getElementById("lessonDate").value;
        const startTime = document.getElementById("lessonStartTime").value;
        const endTime = document.getElementById("lessonEndTime").value;
        const selectedStudents = $('#studentsSelect').val();

        // Валідація
        if (!validateLessonData(description, lessonDate, startTime, endTime, selectedStudents)) {
            return;
        }

        let lessonData = {
            description: description,
            startTime: lessonDate + "T" + startTime,
            endTime: lessonDate + "T" + endTime,
            studentIds: selectedStudents
        };

        console.log("📤 Sending data:", lessonData);
        let newLesson = await createLesson(lessonData);
        console.log("✅ Lesson added:", newLesson);

        alert("✅ Lesson added");

        modal.hide();

        // Оновлюємо події на календарі
        const { start, end } = getCurrentDateRange();
        updateCalendarEvents(getCalendarInstance(), start, end);

    } catch (error) {
        alert(error.message || "Failed to save lesson");
    }
}