// File: TeacherOrganizer/wwwroot/js/api_user.js

export async function getUserById(userId) {
    try {
        const response = await fetch(`/api/Users/${userId}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        }
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export async function fetchStudents() {
    try {
        let response = await fetch("/api/Users/Students");
        if (!response.ok) throw new Error("Failed to fetch students");
        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        return [];
    }
}
export async function getUserRoles(userId) {
    try {
        const response = await fetch(`/api/Users/${userId}/roles`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch user roles: ${response.status} ${response.statusText}`);
        }
        const roles = await response.json();
        return roles;
    } catch (error) {
        console.error("Error fetching user roles:", error);
        return null;
    }
}
