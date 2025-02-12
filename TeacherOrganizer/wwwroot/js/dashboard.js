document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".menu a").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            let page = this.getAttribute("data-page");

            let contentPlaceholder = document.getElementById("content-placeholder");

            switch (page) {
                case "calendar":
                    contentPlaceholder.innerHTML = "<h2>📅 Calendar</h2><p>Here you will see your scheduled lessons.</p>";
                    break;
                case "dictionary":
                    contentPlaceholder.innerHTML = "<h2>📖 Dictionary</h2><p>Manage your personal and shared dictionaries here.</p>";
                    break;
                case "settings":
                    contentPlaceholder.innerHTML = "<h2>⚙️ Settings</h2><p>Adjust your profile and preferences.</p>";
                    break;
                default:
                    contentPlaceholder.innerHTML = "<h2>Welcome!</h2><p>Select a menu item.</p>";
                    break;
            }
        });
    });
});
