document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Dashboard loaded!");

    document.querySelectorAll(".menu a").forEach(link => {
        link.addEventListener("click", async function (e) {
            e.preventDefault();
            let page = this.getAttribute("data-page");
            let contentPlaceholder = document.getElementById("content-placeholder");

            contentPlaceholder.innerHTML = ""; // Clear existing content

            if (page === "calendar") {
                //  Crucially, wait for the calendar module to load *before* trying to render.
                try {
                    const calendarModule = await import("./calendar.js");
                    console.log("📅 Calendar module loaded");
                    calendarModule.initializeCalendar(contentPlaceholder); // Call the initialization function
                } catch (error) {
                    console.error("❌ Error loading calendar module:", error);
                    contentPlaceholder.innerHTML = "<p>Error loading calendar.</p>"; // Display an error message
                }
            } else if (page === "dictionary") {
                contentPlaceholder.innerHTML = "<h2>Dictionary Page</h2>";
            } else if (page === "settings") {
                contentPlaceholder.innerHTML = "<h2>Settings Page</h2>";
            }
        });
    });
});