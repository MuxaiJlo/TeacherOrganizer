// File: TeacherOrganizer/wwwroot/js/calendar/calendar-utils.js

// Функції для роботи з датами
export const formatDateForApi = (date) => {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0") + "T" +
        String(date.getHours()).padStart(2, "0") + ":" +
        String(date.getMinutes()).padStart(2, "0") + ":" +
        String(date.getSeconds()).padStart(2, "0");
};

// Функції валідації
export function validateLessonData(description, date, startTime, endTime, studentIds) {
    // Перевіряємо, чи всі обов'язкові поля заповнені
    if (!description || !date || !startTime || !endTime) {
        alert("All fields are required");
        return false;
    }

    // Перевіряємо довжину опису
    if (description.length > 500) {
        alert("Description cannot exceed 500 characters");
        return false;
    }

    // Перевіряємо, чи вибрано принаймні одного студента
    if (!studentIds || studentIds.length === 0) {
        alert("Please select at least one student");
        return false;
    }

    // Перевіряємо, чи кінцевий час більший за початковий
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (end <= start) {
        alert("End time must be after start time");
        return false;
    }

    return true;
}

export function validateUpdateData(description, date, startTime, endTime) {
    // Перевіряємо, чи всі обов'язкові поля заповнені
    if (!description || !date || !startTime || !endTime) {
        alert("All fields are required");
        return false;
    }

    // Перевіряємо довжину опису
    if (description.length > 500) {
        alert("Description cannot exceed 500 characters");
        return false;
    }

    // Перевіряємо, чи кінцевий час більший за початковий
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (end <= start) {
        alert("End time must be after start time");
        return false;
    }

    return true;
}

export function validateRescheduleData(date, startTime, endTime) {
    // Перевіряємо, чи всі обов'язкові поля заповнені
    if (!date || !startTime || !endTime) {
        alert("All fields are required");
        return false;
    }

    // Перевіряємо, чи кінцевий час більший за початковий
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (end <= start) {
        alert("End time must be after start time");
        return false;
    }

    return true;
}