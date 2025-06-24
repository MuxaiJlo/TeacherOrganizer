import { getAccessibleLessonDetails, getLessonDetailsById, updateLessonDetails, createLessonDetails, deleteLessonDetails } from "../api/api_lessonDetails.js";
import { getScheduledLessons, fetchLessonById } from "../api/api_lessons.js";

export async function initializeLessonDetails(container, currentUserRole) { // Додано currentUserRole як параметр
    try {
        const response = await fetch("/modals/lessonDetailsList.html");
        const html = await response.text();
        container.innerHTML = html;

        const createNoteBtn = document.getElementById("create-note-btn");
        if (createNoteBtn) {
            if (currentUserRole === "Student") {
                createNoteBtn.style.display = "none";
            } else {
                createNoteBtn.addEventListener("click", () => {
                    openLessonNoteEditor(container, null, currentUserRole); 
                });
            }
        }

        await loadLessonNotesList(container, currentUserRole); 
    } catch (error) {
        console.error("Error loading template:", error);
        container.innerHTML = `<div class="alert alert-danger">Failed to load template: ${error.message}</div>`;
    }
}

async function loadLessonNotesList(container, currentUserRole) {
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

        const getActionButtonsHtml = (lessonDetailsId) => {
            let buttonsHtml = `<button class="btn btn-sm btn-info view-btn" data-id="${lessonDetailsId}" title="View"><img src="../icons/view.png" alt="View" class="action-icon"></button>`; //
            if (currentUserRole !== "Student") {
                buttonsHtml += ` <button class="btn btn-sm btn-danger delete-btn" data-id="${lessonDetailsId}" title="Delete"><img src="../icons/delete.png" alt="Delete" class="action-icon"></button>`; //
            }
            return buttonsHtml;
        };
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
                            ${getActionButtonsHtml(l.lessonDetailsId)}
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        `;

        listContainer.innerHTML = "";
        listContainer.appendChild(table);

        document.querySelectorAll(".view-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                // ВИПРАВЛЕНО: Використовуємо e.currentTarget
                const id = e.currentTarget.getAttribute("data-id");
                console.log("View button clicked, ID:", id); // Для дебагу
                if (id) {
                    await openLessonNotePreview(container, id, currentUserRole);
                } else {
                    console.error("View button: data-id not found on currentTarget", e.currentTarget);
                }
            });
        });

        if (currentUserRole !== "Student") {
            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    // ВИПРАВЛЕНО: Використовуємо e.currentTarget
                    const id = e.currentTarget.getAttribute("data-id");
                    console.log("Delete button clicked, ID:", id); // Для дебагу
                    if (id && confirm("Are you sure you want to delete this note?")) {
                        try {
                            await deleteLessonDetails(id);
                            alert("✅ Note deleted successfully!");
                            await loadLessonNotesList(container, currentUserRole);
                        } catch (error) {
                            console.error("Error deleting note:", error);
                            alert(`Failed to delete note: ${error.message}`);
                        }
                    } else if (!id) {
                        console.error("Delete button: data-id not found on currentTarget", e.currentTarget);
                    }
                });
            });
        }

    } catch (error) {
        console.error("❌ Failed to load lesson notes:", error);
        document.getElementById("lesson-details-list").innerHTML =
            `<div class="alert alert-danger">Failed to load lesson notes: ${error.message}</div>`;
    }
}
async function openLessonNotePreview(container, lessonDetailsId, currentUserRole) { // Додано currentUserRole
    try {
        container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        const templateResponse = await fetch("/modals/lessonDetailsPreview.html");
        const template = await templateResponse.text();
        container.innerHTML = template;

        const lessonDetails = await getLessonDetailsById(lessonDetailsId); // API має враховувати роль
        const lesson = await fetchLessonById(lessonDetails.lessonId);

        document.getElementById("lesson-title").textContent = lesson.description || "Lesson Notes";
        document.getElementById("lesson-time").textContent = `${new Date(lesson.startTime).toLocaleString()} - ${new Date(lesson.endTime).toLocaleString()}`;
        document.getElementById("lesson-content").innerHTML = lessonDetails.content;

        const editBtn = document.getElementById("edit-btn");
        if (editBtn) {
            if (currentUserRole === "Student") {
                editBtn.style.display = "none";
            } else {
                editBtn.addEventListener("click", () => {
                    openLessonNoteEditor(container, lessonDetailsId, currentUserRole); // Передаємо currentUserRole
                });
            }
        }

        document.getElementById("back-btn").addEventListener("click", () => {
            // Повертаємося до списку, передаючи роль для коректного відображення
            initializeLessonDetails(container, currentUserRole);
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