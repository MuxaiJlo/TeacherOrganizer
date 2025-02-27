import { fetchLessons, fetchStudents, createLesson } from "./api.js";
let calendar = null;
let modal = null;

export function initializeCalendar(contentPlaceholder) {
    contentPlaceholder.innerHTML = `<div id="calendar"></div>`;

    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
        console.error("❌ Calendar element not found!");
        return;
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
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
                let events = await fetchLessons(); // Викликаємо fetchLessons без параметрів
                successCallback(events);
            } catch (error) {
                console.error("❌ Error fetching events:", error);
                failureCallback();
            }
        },
        dateClick: function (info) {
            openLessonModal(info.dateStr);
        }
    });

    calendar.render();

    loadModal();
    loadStudentsList();
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

        modal.hide();

        setTimeout(() => {
            calendar.refetchEvents();
        }, 500); // Додаємо затримку, щоб події оновилися після закриття модалки

    } catch (error) {
        alert(error.message || "Failed to save lesson");
    }
}
