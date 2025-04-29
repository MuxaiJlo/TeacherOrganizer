import { getUserByUsername, updateUserSettings, changePassword } from "../api/api_user.js";

export async function initializeSettings(container, username) {
    try {
        const html = await fetch("/modals/settings.html");
        const content = await html.text();
        container.innerHTML = content;

        const userData = await getUserByUsername(username);
        if (!userData) {
            container.innerHTML = "<p>Не вдалося знайти користувача.</p>";
            return;
        }

        const userId = userData.id;
        document.getElementById("username").value = userData.userName;
        document.getElementById("firstName").value = userData.firstName || "";
        document.getElementById("lastName").value = userData.lastName || "";
        document.getElementById("email").value = userData.email || "";

        document.getElementById("settings-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const updated = {
                userName: userData.userName, // обов’язково передай!
                firstName: document.getElementById("firstName").value,
                lastName: document.getElementById("lastName").value,
                email: document.getElementById("email").value
            };
            const result = await updateUserSettings(userId, updated);
            if (result) alert("✅ Дані оновлено!");
            else alert("❌ Помилка оновлення.");
        });

        document.getElementById("password-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const passwordData = {
                currentPassword: document.getElementById("currentPassword").value,
                newPassword: document.getElementById("newPassword").value
            };
            const result = await changePassword(userId, passwordData);
            if (result) {
                alert("🔒 Пароль змінено.");
                document.getElementById("password-form").reset();
            } else {
                alert("❌ Помилка зміни паролю.");
            }
        });
    } catch (error) {
        console.error("❌ Error loading settings:", error);
        container.innerHTML = "<p>Помилка завантаження.</p>";
    }
}
