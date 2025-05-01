document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Dashboard loaded!");

    // Обробники для навігаційних посилань
    document.querySelectorAll(".menu a[data-page]").forEach(link => {
        link.addEventListener("click", async function (e) {
            e.preventDefault();
            let page = this.getAttribute("data-page");
            let contentPlaceholder = document.getElementById("content-placeholder");
            contentPlaceholder.innerHTML = ""; // Clear existing content

            if (page === "calendar") {
                try {
                    const calendarModule = await import("./calendar/calendar.js");
                    console.log("📅 Calendar module loaded");
                    calendarModule.initializeCalendar(contentPlaceholder);
                } catch (error) {
                    console.error("❌ Error loading calendar module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading calendar.</p>";
                }
            } else if (page === "dictionary") {
                try {
                    const dictionaryModule = await import("./dictionary/dictionary.js");
                    console.log("📖 Dictionary module loaded");
                    dictionaryModule.initializeDictionary(contentPlaceholder);
                } catch (error) {
                    console.error("❌ Error loading dictionary module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading dictionary.</p>";
                }
            } else if (page === "settings") {
                try {
                    const settingsModule = await import("./settings/settings.js");
                    console.log("⚙️ Settings module loaded");
                    settingsModule.initializeSettings(contentPlaceholder, window.currentUserName); // передаємо ім’я користувача
                } catch (error) {
                    console.error("❌ Error loading settings module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading settings.</p>";
                }
            } else if (page === "student-list") {
                try {
                    const studentListModule = await import("./student/studentList.js");
                    console.log("🧑‍🎓 Student List module loaded");
                    studentListModule.initializeStudentList(contentPlaceholder);
                } catch (error) {
                    console.error("❌ Error loading student list module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading student list.</p>";
                }
            } else if (page === "reschedule-requests") {
                try {
                    const rescheduleModule = await import("./reschedule/reschedule.js");
                    console.log("🔄 Reschedule module loaded");
                    rescheduleModule.initializeRescheduleRequests(contentPlaceholder);
                } catch (error) {
                    console.error("❌ Error loading reschedule module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading reschedule requests.</p>";
                }
            }
            else if (page === "lesson-notes") {
                try {
                    const lessonDetailsModule = await import("./lessonDetails/lessonDetails.js");
                    console.log("📚 Lesson Details module loaded");
                    lessonDetailsModule.initializeLessonDetails(contentPlaceholder);
                } catch (error) {
                    console.error("❌ Error loading lesson details module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading lesson details.</p>";
                }
            }
        });
    });

    // Додаємо окремий обробник для кнопки логауту
    const logoutButton = document.querySelector(".menu a.logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function (e) {
            e.preventDefault();
            handleLogout();
        });
    } else {
        console.error("Logout button not found");
    }
});

// Функція для обробки логауту
async function handleLogout() {
    try {
        let response = await fetch("/AuthView/Logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },
            credentials: "same-origin"
        });
        if (response.ok) {
            window.location.href = "/";
        } else {
            console.error("Logout failed");
        }
    } catch (error) {
        console.error("Error during logout:", error);
    }
}