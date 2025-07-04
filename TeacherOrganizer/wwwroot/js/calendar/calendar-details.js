﻿// File: TeacherOrganizer/wwwroot/js/calendar/calendar-details.js

import { fetchLessonById, updateLesson, cancelLesson } from "../api/api_lessons.js";
import { rescheduleLesson } from "../api/api_reschedule.js";
import { validateUpdateData, validateRescheduleData } from "./calendar-utils.js";
import { updateCalendarEvents } from "./calendar-events.js";
import { getCurrentDateRange, getCalendarInstance } from "./calendar.js";

// Module variables
let modalDetails = null;
let currentLessonId = null;

export async function initLessonDetailsModal() {
    try {
        const response = await fetch("/modals/lesson-details-modal.html");
        if (!response.ok) throw new Error("Failed to load modal details template");

        const modalHtml = await response.text();
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        const modalEl = document.getElementById("lessonDetailsModal");
        if (!modalEl) {
            console.error("❌ Modal details element not found!");
            return null;
        }

        modalDetails = new bootstrap.Modal(modalEl);
        setupEventHandlers(); 
        let previouslyFocusedElement = null; // Store the element that had focus before the modal was opened

        modalEl.addEventListener("shown.bs.modal", () => {
            previouslyFocusedElement = document.activeElement;

            // Focus on the first available element
            const firstFocusableElement = modalEl.querySelector("button:not([disabled])");
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }

            modalEl.removeAttribute("aria-hidden");

        });
        

        modalEl.addEventListener("hidden.bs.modal", () => {
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus();
            }
            modalEl.setAttribute("aria-hidden", "true");
        });

        return modalDetails;
    } catch (error) {
        console.error("❌ Error loading modal details:", error);
        return null;
    }
}

function setupEventHandlers() {
    const actionSelect = document.getElementById("actionSelect");
    actionSelect.addEventListener("change", handleActionChange);


    document.getElementById("saveChangesBtn").addEventListener("click", () => {
        const selectedAction = actionSelect.value;
        if (selectedAction === "update") {
            saveLessonDetails();
        } else if (selectedAction === "reschedule") {
            rescheduleCurrentLesson();
        }
    });


    document.getElementById("cancelLessonBtn").addEventListener("click", cancelCurrentLesson);


    if (currentUserRole === "Student") {
        for (let i = actionSelect.options.length - 1; i >= 0; i--) {
            if (actionSelect.options[i].value !== "reschedule" && actionSelect.options[i].value !== "none") {
                actionSelect.remove(i);
            }
        }
        document.getElementById("updateFields").style.display = "none";
        document.getElementById("cancelConfirmation").style.display = "none";
        document.getElementById("saveChangesBtn").textContent = "Propose Reschedule";
        document.getElementById("cancelLessonBtn").style.display = "none";
    }
}

export async function openLessonDetailsModal(lessonId) {
    if (!lessonId) {
        console.error("❌ lessonId is undefined or null");
        return;
    }
    console.log(`ℹ️ Fetching lesson with ID: ${lessonId}`);

    try {
        currentLessonId = lessonId;
        const lesson = await fetchLessonById(lessonId);
        if (!lesson) {
            alert("Lesson not found");
            return;
        }

        populateModalFields(lesson);

        const actionSelect = document.getElementById("actionSelect");
        actionSelect.value = "none"; // Reset selection
        handleActionChange(); // Update UI

        modalDetails.show();
    } catch (error) {
        console.error("❌ Error fetching lesson details:", error);
        alert("Failed to load lesson details");
    }
}

function populateModalFields(lesson) {
    // Set values in existing fields
    document.getElementById("detailLessonDate").value = lesson.startTime.split("T")[0];
    document.getElementById("detailLessonStartTime").value = lesson.startTime.split("T")[1].substring(0, 5);
    document.getElementById("detailLessonEndTime").value = lesson.endTime.split("T")[1].substring(0, 5);
    document.getElementById("detailLessonDescription").value = lesson.description;

    // Also populate fields for update
    document.getElementById("updateLessonDate").value = lesson.startTime.split("T")[0];
    document.getElementById("updateLessonStartTime").value = lesson.startTime.split("T")[1].substring(0, 5);
    document.getElementById("updateLessonEndTime").value = lesson.endTime.split("T")[1].substring(0, 5);
    document.getElementById("updateLessonDescription").value = lesson.description;

    // And fields for reschedule
    document.getElementById("rescheduleLessonDate").value = lesson.startTime.split("T")[0];
    document.getElementById("rescheduleLessonStartTime").value = lesson.startTime.split("T")[1].substring(0, 5);
    document.getElementById("rescheduleLessonEndTime").value = lesson.endTime.split("T")[1].substring(0, 5);

    // Make readonly fields look like regular fields
    const readOnlyFields = document.querySelectorAll('.modal-body input[readonly], .modal-body textarea[readonly]');
    readOnlyFields.forEach(field => {
        field.style.backgroundColor = '#fff';
        field.style.border = '1px solid #ced4da';
    });

    // Display Students with consistent styling
    const studentsContainer = document.getElementById("students-container");
    studentsContainer.innerHTML = ""; // Clear previous content

    // Create a container div with the same styling as other form groups
    const studentsFormGroup = document.createElement("div");
    studentsFormGroup.className = "mb-3";

    // Create a label like other form fields
    const studentsLabel = document.createElement("label");
    studentsLabel.className = "form-label";
    studentsLabel.textContent = "Students";
    studentsFormGroup.appendChild(studentsLabel);

    // Create a container for the students list
    const studentsListContainer = document.createElement("div");
    studentsListContainer.className = "form-control";
    studentsListContainer.style.height = "auto";
    studentsListContainer.style.maxHeight = "120px";
    studentsListContainer.style.overflowY = "auto";

    if (lesson.students && lesson.students.length > 0) {
        const studentsList = document.createElement("ul");
        studentsList.className = "list-unstyled m-0";

        lesson.students.forEach(student => {
            const studentItem = document.createElement("li");
            studentItem.textContent = student.userName;
            studentsList.appendChild(studentItem);
        });

        studentsListContainer.appendChild(studentsList);
    } else {
        studentsListContainer.textContent = "No students assigned";
    }

    studentsFormGroup.appendChild(studentsListContainer);
    studentsContainer.appendChild(studentsFormGroup);
    const badge = document.getElementById("lessonStatusBadge");

    if (badge) {
        let statusText = lesson.status;

        if (typeof statusText === "number") {
            switch (statusText) {
                case 0: statusText = "Scheduled"; break;
                case 1: statusText = "Cancelled"; break;
                case 2: statusText = "Completed"; break;
                case 3: statusText = "RescheduledRequest"; break;
                default: statusText = "Unknown"; break;
            }
        }

        badge.classList.remove("bg-danger", "bg-success", "bg-primary", "bg-warning", "bg-secondary");
        switch (statusText) {
            case "Cancelled":
                badge.classList.add("bg-danger");
                badge.textContent = "Cancelled";
                break;
            case "Completed":
                badge.classList.add("bg-success");
                badge.textContent = "Completed";
                break;
            case "Scheduled":
                badge.classList.add("bg-primary");
                badge.textContent = "Scheduled";
                break;
            case "RescheduledRequest":
                badge.classList.add("bg-warning");
                badge.textContent = "Rescheduled";
                break;
            default:
                badge.classList.add("bg-secondary");
                badge.textContent = statusText;
                break;
        }
    }
}

function handleActionChange() {
    const actionSelect = document.getElementById("actionSelect");
    const updateFields = document.getElementById("updateFields");
    const rescheduleFields = document.getElementById("rescheduleFields");
    const cancelConfirmation = document.getElementById("cancelConfirmation");
    const saveChangesBtn = document.getElementById("saveChangesBtn");
    const cancelLessonBtn = document.getElementById("cancelLessonBtn");

    updateFields.style.display = "none";
    rescheduleFields.style.display = "none";
    cancelConfirmation.style.display = "none";
    saveChangesBtn.style.display = "none";
    cancelLessonBtn.style.display = "none";

    if (actionSelect.value === "update") {
        updateFields.style.display = "block";
        saveChangesBtn.style.display = "inline-block";
    } else if (actionSelect.value === "reschedule") {
        rescheduleFields.style.display = "block";
        saveChangesBtn.style.display = "inline-block";
        if (currentUserRole === "Student") {
            saveChangesBtn.textContent = "Propose Reschedule";
        } else {
            saveChangesBtn.textContent = "Save Changes";
        }
    } else if (actionSelect.value === "cancel") {
        cancelConfirmation.style.display = "block";
        cancelLessonBtn.style.display = "inline-block";
        cancelLessonBtn.textContent = "Cancel Lesson";
    }

}

// Functions to update, cancel, and reschedule lessons
async function saveLessonDetails() {
    try {
        const description = document.getElementById("updateLessonDescription").value;
        const lessonDate = document.getElementById("updateLessonDate").value;
        const startTime = document.getElementById("updateLessonStartTime").value;
        const endTime = document.getElementById("updateLessonEndTime").value;

        // Validation
        if (!validateUpdateData(description, lessonDate, startTime, endTime)) {
            return;
        }

        const updatedLessonData = {
            startTime: lessonDate + "T" + startTime,
            endTime: lessonDate + "T" + endTime,
            description: description,
        };

        console.log(`🔄 Updating lesson with ID: ${currentLessonId}`);
        let updatedLesson = await updateLesson(currentLessonId, updatedLessonData);
        console.log("✅ Lesson updated:", updatedLesson);
        modalDetails.hide();

        // Update calendar events
        const { start, end } = getCurrentDateRange();
        updateCalendarEvents(getCalendarInstance(), start, end);
    } catch (error) {
        alert(error.message || "Failed to update lesson");
    }
}

async function cancelCurrentLesson() {
    console.log(`🚫 Cancelling lesson with ID: ${currentLessonId}`);
    try {
        await cancelLesson(currentLessonId);
        console.log("✅ Lesson cancelled");
        modalDetails.hide();

        const { start, end } = getCurrentDateRange();
        updateCalendarEvents(getCalendarInstance(), start, end);
    } catch (error) {
        alert(error.message || "Failed to cancel lesson");
    }
}

async function rescheduleCurrentLesson() {
    try {
        const lessonDate = document.getElementById("rescheduleLessonDate").value;
        const startTime = document.getElementById("rescheduleLessonStartTime").value;
        const endTime = document.getElementById("rescheduleLessonEndTime").value;

        // Validation
        if (!validateRescheduleData(lessonDate, startTime, endTime)) {
            return;
        }

        const rescheduleData = {
            proposedStartTime: lessonDate + "T" + startTime,
            proposedEndTime: lessonDate + "T" + endTime,
        };

        console.log(`🔄 Rescheduling lesson with ID: ${currentLessonId}`);
        let rescheduledLesson = await rescheduleLesson(currentLessonId, rescheduleData);
        console.log("✅ Lesson reschedule proposed: ", rescheduledLesson);
        modalDetails.hide();

        // Update calendar events
        const { start, end } = getCurrentDateRange();
        updateCalendarEvents(getCalendarInstance(), start, end);
    } catch (error) {
        alert(error.message || "Failed to propose reschedule");
    }
}
function getStatusLabelAndColor(status) {
    if (status === "Canceled" || status === 1) {
        return { label: "Скасовано", color: "#dc3545" };
    } else if (status === "Completed" || status === 2) {
        return { label: "Завершено", color: "#00ff00" };
    } else if (status === "RescheduledRequest" || status === 3) {
        return { label: "Запит на перенесення", color: "#ffc107" };
    }
    return { label: "Заплановано", color: "#3788d8" };
}
