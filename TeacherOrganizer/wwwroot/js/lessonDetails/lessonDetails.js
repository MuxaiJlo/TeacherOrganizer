import { getAccessibleLessonDetails, getLessonDetailsById, updateLessonDetails, createLessonDetails, deleteLessonDetails } from "../api/api_lessonDetails.js";
import { getScheduledLessons, fetchLessonById } from "../api/api_lessons.js";

export async function initializeLessonDetails(container) {
    try {
        const response = await fetch("/modals/lessonDetailsList.html");
        const html = await response.text();
        container.innerHTML = html;

        document.getElementById("create-note-btn").addEventListener("click", () => {
            openLessonNoteEditor(container, null); // null for creating a new note
        });

        await loadLessonNotesList(container);
    } catch (error) {
        console.error("Error loading template:", error);
        container.innerHTML = `<div class="alert alert-danger">Failed to load template: ${error.message}</div>`;
    }
}

async function loadLessonNotesList(container) {
    try {
        const lessons = await getAccessibleLessonDetails();
        const listContainer = document.getElementById("lesson-details-list");

        if (lessons.length === 0) {
            listContainer.innerHTML = "<p>No lesson notes available.</p>";
            return;
        }

        const enhancedLessons = await Promise.all(lessons.map(async (lessonDetail) => {
            try {
                const lesson = await fetchLessonById(lessonDetail.lessonId);
                return {
                    ...lessonDetail,
                    description: lesson.description || "No description",
                    startTime: new Date(lesson.startTime).toLocaleString(),
                    endTime: new Date(lesson.endTime).toLocaleString(),
                    // We'll use the accessibleUserIds directly from lessonDetail
                };
            } catch (error) {
                console.error(`Error fetching details for lesson ${lessonDetail.lessonId}:`, error);
                return {
                    ...lessonDetail,
                    description: "Error loading details",
                    startTime: "Unknown",
                    endTime: "Unknown"
                };
            }
        }));

        const table = document.createElement("table");
        table.classList.add("table", "table-striped", "table-hover");
        table.innerHTML = `
    <thead class="table-dark">
        <tr>
            <th>Lesson</th>
            <th>Time</th>
            <th>Users with Access</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody class="text-dark">
        ${enhancedLessons.map(l => `
            <tr>
                <td>${l.description}</td>
                <td>${l.startTime} - ${l.endTime}</td>
                <td>${l.accessibleUserIds ? l.accessibleUserIds.join(", ") : "No users"}</td>
                <td>
                    <button class="btn btn-sm btn-info view-btn" data-id="${l.lessonDetailsId}">View</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${l.lessonDetailsId}">Delete</button>
                </td>
            </tr>
        `).join("")}
    </tbody>
`;

        listContainer.innerHTML = "";
        listContainer.appendChild(table);

        // Add event listeners for view and delete buttons
        document.querySelectorAll(".view-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.getAttribute("data-id");
                await openLessonNotePreview(container, id);
            });
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                if (confirm("Are you sure you want to delete this note?")) {
                    const id = e.target.getAttribute("data-id");
                    try {
                        await deleteLessonDetails(id);
                        alert("✅ Note deleted successfully!");
                        await loadLessonNotesList(container);
                    } catch (error) {
                        console.error("Error deleting note:", error);
                        alert(`Failed to delete note: ${error.message}`);
                    }
                }
            });
        });

    } catch (error) {
        console.error("❌ Failed to load lesson notes:", error);
        document.getElementById("lesson-details-list").innerHTML =
            `<div class="alert alert-danger">Failed to load lesson notes: ${error.message}</div>`;
    }
}

async function openLessonNotePreview(container, lessonDetailsId) {
    try {
        container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        // Fetch the preview template
        const templateResponse = await fetch("/modals/lessonDetailsPreview.html");
        const template = await templateResponse.text();
        container.innerHTML = template;

        // Get the lesson details
        const lessonDetails = await getLessonDetailsById(lessonDetailsId);
        const lesson = await fetchLessonById(lessonDetails.lessonId);

        // Fill in the template with the lesson details
        document.getElementById("lesson-title").textContent = lesson.description || "Lesson Notes";
        document.getElementById("lesson-time").textContent = `${new Date(lesson.startTime).toLocaleString()} - ${new Date(lesson.endTime).toLocaleString()}`;
        document.getElementById("lesson-content").innerHTML = lessonDetails.content;

        // Add event listeners for the buttons
        document.getElementById("edit-btn").addEventListener("click", () => {
            openLessonNoteEditor(container, lessonDetailsId);
        });

        document.getElementById("back-btn").addEventListener("click", () => {
            initializeLessonDetails(container);
        });

    } catch (error) {
        console.error("Error loading lesson preview:", error);
        container.innerHTML = `<div class="alert alert-danger">Failed to load lesson preview: ${error.message}</div>`;
    }
}

async function openLessonNoteEditor(container, lessonDetailsId) {
    try {
        container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        // Load the appropriate template based on whether we're creating or editing
        const templatePath = lessonDetailsId
            ? "/modals/lessonDetailsEdit.html"
            : "/modals/lessonDetailsCreate.html";

        const response = await fetch(templatePath);
        const html = await response.text();
        container.innerHTML = html;

        let lessonData = {
            lessonId: "",
            content: ""
        };

        // If editing an existing note
        if (lessonDetailsId) {
            try {
                const existingNote = await getLessonDetailsById(lessonDetailsId);
                lessonData.lessonId = existingNote.lessonId;
                lessonData.content = existingNote.content;

                // Get lesson info for display
                const lesson = await fetchLessonById(lessonData.lessonId);
                document.getElementById("lesson-info").textContent =
                    `${lesson.description}: ${new Date(lesson.startTime).toLocaleString()} - ${new Date(lesson.endTime).toLocaleString()}`;
            } catch (error) {
                console.error("Error fetching lesson details:", error);
                alert("Failed to load lesson details!");
                initializeLessonDetails(container);
                return;
            }
        }
        // If creating a new note
        else {
            const scheduledLessons = await getScheduledLessons();
            const lessonSelect = document.getElementById("lesson-select");

            scheduledLessons.forEach(l => {
                const option = document.createElement("option");
                option.value = l.lessonId;
                option.textContent = `${l.description}: ${new Date(l.startTime).toLocaleString()} - ${new Date(l.endTime).toLocaleString()}`;
                lessonSelect.appendChild(option);
            });
        }

        // Initialize Quill editor
        const quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'script': 'sub' }, { 'script': 'super' }],
                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['clean']
                ]
            }
        });

        if (lessonData.content) {
            quill.root.innerHTML = lessonData.content;
        }

        document.getElementById("note-form").addEventListener("submit", async (e) => {
            e.preventDefault();

            const content = quill.root.innerHTML;
            const plainText = quill.getText().trim();
            if (!plainText) {
                alert("Please enter some content before saving!");
                return;
            }
            try {
                if (lessonDetailsId) {
                    await updateLessonDetails(lessonDetailsId, content);
                    alert("✅ Changes saved!");
                    await openLessonNotePreview(container, lessonDetailsId);
                } else {
                    const selectedLessonId = document.getElementById("lesson-select").value;
                    if (!selectedLessonId) {
                        alert("Please select a lesson first!");
                        return;
                    }

                    const lessonDetails = await fetchLessonById(parseInt(selectedLessonId));

                    const accessibleUserIds = [];

                    if (lessonDetails.teacher && lessonDetails.teacher.userName) {
                        console.log("Adding teacher username:", lessonDetails.teacher.userName);
                        accessibleUserIds.push(lessonDetails.teacher.userName);
                    }

                    if (lessonDetails.students && Array.isArray(lessonDetails.students)) {
                        const studentUsernames = lessonDetails.students.map(student => student.userName);
                        console.log("Adding student usernames:", studentUsernames);
                        accessibleUserIds.push(...studentUsernames);
                    }

                    console.log("Final accessible user IDs (usernames):", accessibleUserIds);

                    const result = await createLessonDetails({
                        lessonId: parseInt(selectedLessonId),
                        content: content,
                        accessibleUserIds: accessibleUserIds
                    });

                    alert("✅ Note created with automatic access for teacher and students!");
                    await openLessonNotePreview(container, result.lessonDetailsId);
                }
            } catch (error) {
                console.error("Error saving note:", error);
                alert(`Failed to save: ${error.message}`);
            }
        });

        document.getElementById("cancel-btn").addEventListener("click", () => {
            if (lessonDetailsId) {
                openLessonNotePreview(container, lessonDetailsId);
            } else {
                initializeLessonDetails(container);
            }
        });
    } catch (error) {
        console.error("Error loading editor:", error);
        container.innerHTML = `<div class="alert alert-danger">Failed to load editor: ${error.message}</div>`;
    }
}