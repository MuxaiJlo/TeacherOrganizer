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
                    const calendarModule = await import("./calendar.js");
                    console.log("📅 Calendar module loaded");
                    calendarModule.initializeCalendar(contentPlaceholder);
                } catch (error) {
                    console.error("❌ Error loading calendar module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading calendar.</p>";
                }
            } else if (page === "dictionary") {
                try {
                    const dictionaryModule = await import("./dictionary.js");
                    console.log("📖 Dictionary module loaded");
                    dictionaryModule.initializeDictionary(contentPlaceholder);
                } catch (error) {
                    console.error("❌ Error loading dictionary module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading dictionary.</p>";
                }
            } else if (page === "settings") {
                contentPlaceholder.innerHTML = "<h2>Settings Page</h2>";
            } else if (page === "student-list") {
                try {
                    const studentListModule = await import("./student-list.js");
                    console.log("🧑‍🎓 Student List module loaded");
                    studentListModule.initializeStudentList(contentPlaceholder);
                } catch (error) {
                    console.error("❌ Error loading student list module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading student list.</p>";
                }
            } else if (page === "reschedule-requests") {
                contentPlaceholder.innerHTML = "<h2>Reschedule Requests</h2><p>Content for reschedule requests will go here.</p>";
            } else if (page === "lesson-notes") {
                contentPlaceholder.innerHTML = "<h2>Lesson Notes</h2><p>Content for lesson notes will go here.</p>";
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