import { fetchLessons, fetchStudents, createLesson } from "./api.js";

let calendar = null; // Змінна для зберігання календаря на рівні модуля

// Функція для ініціалізації календаря, тепер експортована
export function initializeCalendar(contentPlaceholder) {
    contentPlaceholder.innerHTML = `<div id="calendar"></div>`; // Встановлюємо HTML *всередині* модуля

    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
        console.error("❌ Calendar element not found!"); // Цього вже не повинно статися
        return;
    }

    calendar = new FullCalendar.Calendar(calendarEl, { // Присвоюємо значення змінній calendar на рівні модуля
        initialView: "dayGridMonth",
        height: "800px",
        aspectRatio: 2,
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        events: async function (fetchInfo, successCallback, failureCallback) {
            try {
                let events = await fetchLessons(fetchInfo.startStr, fetchInfo.endStr);
                successCallback(events);
            } catch (error) {
                console.error("❌ Error fetching events:", error);
                failureCallback([]); // Важливо: викликаємо failureCallback у разі помилки
            }
        },
        dateClick: function (info) {
            openLessonModal(info.dateStr);
        }
    });

    calendar.render();

    loadModal(); // Викликаємо loadModal тут, після рендерингу календаря
    loadStudentsList(); // Викликаємо loadStudentsList тут, після рендерингу календаря

    document.getElementById("saveLesson")?.addEventListener("click", saveLesson); // Переносимо слухач подій сюди
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
            return;
        }

        modal = new bootstrap.Modal(modalEl); // Ініціалізуємо модальне вікно Bootstrap
        return modal;
    } catch (error) {
        console.error("❌ Error loading modal:", error);
        return null;
    }
}

let modal = null; // Змінна для зберігання модального вікна на рівні модуля

function openLessonModal(date) {
    if (!modal) return;

    console.log("📅 Opening modal for:", date);
    document.getElementById("lessonDate").value = date;
    document.getElementById("lessonStartTime").value = "";
    document.getElementById("lessonEndTime").value = "";
    document.getElementById("lessonDescription").value = "";
    modal.show();
}

async function saveLesson() {
    let selectedStudents = Array.from(document.getElementById("studentsSelect").selectedOptions)
        .map(option => option.value);

    let lessonData = {
        teacherId: "current_teacher_id", // Тут потрібно отримати реальний ID викладача
        description: document.getElementById("lessonDescription").value,
        startTime: document.getElementById("lessonDate").value + "T" + document.getElementById("lessonStartTime").value,
        endTime: document.getElementById("lessonDate").value + "T" + document.getElementById("lessonEndTime").value,
        studentIds: selectedStudents
    };

    console.log("📤 Sending data:", lessonData);
    try {
        let newLesson = await createLesson(lessonData);
        console.log("✅ Lesson added:", newLesson);
        calendar.refetchEvents(); // Оновлюємо відображення подій на календарі
        modal.hide();
    } catch (error) {
        alert(error.message || "Failed to save lesson");
    }
}

async function loadStudentsList() {
    let students = await fetchStudents();
    let studentsSelect = document.getElementById("studentsSelect");
    studentsSelect.innerHTML = "";
    students.forEach(student => {
        let option = document.createElement("option");
        option.value = student.id;
        option.textContent = student.userName;
        studentsSelect.appendChild(option);
    });
}