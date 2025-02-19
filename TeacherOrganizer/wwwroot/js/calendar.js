function loadCalendar() {
    console.log("📅 Initializing calendar...");

    let calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
        console.error("❌ Calendar element not found!");
        return;
    }

    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: "800px",
        aspectRatio: 2,
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        events: function (fetchInfo, successCallback, failureCallback) {
            let start = fetchInfo.startStr.split("T")[0];
            let end = fetchInfo.endStr.split("T")[0];

            fetch(`/api/Lesson/Calendar?start=${start}&end=${end}`)
                .then(response => response.json())
                .then(data => successCallback(data))
                .catch(error => failureCallback(error));
        },
        dateClick: function (info) {
            openLessonModal(info.dateStr);
        }
    });

    calendar.render();
}
function openLessonModal(date) {
    console.log("📅 Opening modal for:", date);

    let modalEl = document.getElementById("lessonModal");
    if (!modalEl) {
        console.error("❌ Modal element not found!");
        return;
    }

    let modal = new bootstrap.Modal(modalEl);

    // Записуємо вибрану дату (тільки час, без дати)
    document.getElementById("lessonDate").value = date;
    document.getElementById("lessonStartTime").value = "";
    document.getElementById("lessonEndTime").value = "";
    document.getElementById("lessonDescription").value = "";

    modal.show();
}
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM Loaded!");

    let saveButton = document.getElementById("saveLesson");

    if (saveButton) {
        saveButton.addEventListener("click", function () {
            console.log("✅ Save button clicked!");

            let lessonData = {
                description: document.getElementById("lessonDescription").value,
                startTime: document.getElementById("lessonDate").value + "T" + document.getElementById("lessonStartTime").value,
                endTime: document.getElementById("lessonDate").value + "T" + document.getElementById("lessonEndTime").value
            };

            console.log("📤 Sending data:", lessonData);

            fetch("/api/Lesson", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lessonData)
            })
                .then(response => response.json())
                .then(data => {
                    console.log("✅ Lesson added:", data);
                    location.reload(); // Оновлюємо сторінку після збереження
                })
                .catch(error => console.error("❌ Error sending request:", error));
        });
    } else {
        console.error("❌ Save button not found!");
    }
});