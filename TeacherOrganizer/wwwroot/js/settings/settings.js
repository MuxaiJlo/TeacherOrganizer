import { getUserByUsername, updateUserSettings, changePassword } from "../api/api_user.js";

export async function initializeSettings(container, username) {
    try {
        const html = await fetch("/modals/settings.html");
        const content = await html.text();
        container.innerHTML = content;

        const userData = await getUserByUsername(username);
        if (!userData) {
            container.innerHTML = "<p>Unable to find the user.</p>";
            return;
        }

        const userId = userData.id;
        document.getElementById("username").value = userData.userName;
        document.getElementById("firstName").value = userData.firstName || "";
        document.getElementById("lastName").value = userData.lastName || "";
        document.getElementById("email").value = userData.email || "";

        // Form for updating user settings
        document.getElementById("settings-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const updated = {
                userName: userData.userName, // Always send this value
                firstName: document.getElementById("firstName").value,
                lastName: document.getElementById("lastName").value,
                email: document.getElementById("email").value
            };

            // Validation: Check if required fields are filled out
            if (!updated.firstName || !updated.lastName || !updated.email) {
                alert("Please fill out all fields.");
                return;
            }

            // Email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(updated.email)) {
                alert("Please enter a valid email address.");
                return;
            }

            const result = await updateUserSettings(userId, updated);
            if (result) alert("✅ Data updated successfully!");
            else alert("❌ Error updating data.");
        });

        // Form for changing password
        document.getElementById("password-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const passwordData = {
                currentPassword: document.getElementById("currentPassword").value,
                newPassword: document.getElementById("newPassword").value
            };

            // Validation: Check if passwords are filled out
            if (!passwordData.currentPassword || !passwordData.newPassword) {
                alert("Please fill out both current and new password fields.");
                return;
            }

            // Password length validation
            if (passwordData.newPassword.length < 6) {
                alert("Password must be at least 6 characters long.");
                return;
            }

            const result = await changePassword(userId, passwordData);
            if (result) {
                alert("🔒 Password changed successfully.");
                document.getElementById("password-form").reset();
            } else {
                alert("❌ Error changing password.");
            }
        });
    } catch (error) {
        console.error("❌ Error loading settings:", error);
        container.innerHTML = "<p>Error loading settings.</p>";
    }
}
