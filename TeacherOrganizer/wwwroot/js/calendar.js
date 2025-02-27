import { fetchLessons, fetchStudents, createLesson } from "./api.js";
let calendar = null;
let modal = null;

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
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
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

    loadModal();
    loadStudentsList();
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
        // Проверяем, какие значения передаются в функцию
        console.log("🔍 Received start:", start);
        console.log("🔍 Received end:", end);

        // Преобразуем даты в ISO-формат
        const formattedStart = start.toISOString().split(".")[0];
        const formattedEnd = end.toISOString().split(".")[0];

        console.log("📤 Sending start:", formattedStart);
        console.log("📤 Sending end:", formattedEnd);

        console.log("Fetching URL:", `/api/Lesson/Calendar?start=${formattedStart}&end=${formattedEnd}`);

        const events = await fetchLessons(formattedStart, formattedEnd);
        calendar.getEvents().forEach(event => event.remove());
        calendar.addEventSource(events);
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

        // Додаємо подію для Select2
        modalEl.addEventListener("shown.bs.modal", function () {
            $('#studentsSelect').select2({
                dropdownParent: $('#lessonModal')
            });
        });

        // ВАЖЛИВО! Додаємо обробник після вставки модального вікна в DOM
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

    console.log(studentsSelect);

    // Переконаємося, що DOM вже завантажено
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

        // Закрываем модалку перед обновлением календаря
        modal.hide();
        updateCalendarEvents(dateStart, dateEnd);
        
        
    } catch (error) {
        alert(error.message || "Failed to save lesson");
    }
}

