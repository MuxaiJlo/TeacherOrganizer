document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Dashboard loaded!");
    let calendar = null; // Глобальна змінна для зберігання екземпляра FullCalendar

    document.querySelectorAll(".menu a").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            let page = this.getAttribute("data-page");
            let contentPlaceholder = document.getElementById("content-placeholder");

            // Очищаємо контент перед загрузкою нової сторінки
            contentPlaceholder.innerHTML = "";

            if (page === "calendar") {
                contentPlaceholder.innerHTML = `
                    <div id="calendar"></div>
                    <!-- Модальне вікно для керування уроками -->
                    <div id="lessonModal" class="modal fade" tabindex="-1">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Lesson Details</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    <form id="lessonForm">
                                        <input type="hidden" id="lessonId">
                                        <input type="hidden" id="lessonDate"> <!-- Дата уроку -->
                                        <div class="mb-3">
                                            <label for="lessonDescription" class="form-label">Description</label>
                                            <input type="text" class="form-control" id="lessonDescription">
                                        </div>
                                        <div class="mb-3">
                                            <label for="lessonStartTime" class="form-label">Start Time</label>
                                            <input type="time" class="form-control" id="lessonStartTime">
                                        </div>
                                        <div class="mb-3">
                                            <label for="lessonEndTime" class="form-label">End Time</label>
                                            <input type="time" class="form-control" id="lessonEndTime">
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-primary" id="saveLesson">Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Ініціалізація FullCalendar
                loadCalendar();

                // Додаємо делегування подій для кнопки "Save"
                document.getElementById("saveLesson").addEventListener("click", function () {
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

                            // Оновлюємо події в календарі
                            if (calendar) {
                                calendar.refetchEvents(); // Оновлення подій без перезавантаження сторінки
                            }

                            // Закриваємо модальне вікно
                            let modal = bootstrap.Modal.getInstance(document.getElementById("lessonModal"));
                            if (modal) {
                                modal.hide();
                            }
                        })
                        .catch(error => console.error("❌ Error sending request:", error));
                });
            } else if (page === "dictionary") {
                contentPlaceholder.innerHTML = "<h2>📖 Dictionary</h2><p>Manage your personal and shared dictionaries here.</p>";
            } else if (page === "settings") {
                contentPlaceholder.innerHTML = "<h2>⚙️ Settings</h2><p>Adjust your profile and preferences.</p>";
            } else {
                contentPlaceholder.innerHTML = "<h2>Welcome!</h2><p>Select a menu item.</p>";
            }
        });
    });

    // Функція для ініціалізації FullCalendar
    function loadCalendar() {
        console.log("📅 Initializing calendar...");
        let calendarEl = document.getElementById("calendar");

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

    // Функція для відкриття модального вікна
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
});