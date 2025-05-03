import { fetchStudents, getUserById } from "../api/api_user.js";

export async function initializeStudentList(container) {
    try {
        // Load HTML template
        const html = await fetch("/modals/studentList.html").then(res => res.text());
        container.innerHTML = html;

        const students = await fetchStudents();
        const tbody = container.querySelector("#student-table tbody");

        students.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.firstName || ""}</td>
                <td>${student.lastName || ""}</td>
                <td>${student.userName}</td>
                <td><span id="lessons-${student.id}">${student.paidLessons ?? 0}</span></td>
                <td><button class="add-btn btn btn-primary btn-sm" data-id="${student.id}">➕</button></td>
            `;

            // Click on row — show details
            row.addEventListener("click", () => openStudentDetails(student.id));
            tbody.appendChild(row);
        });

        // Add lessons buttons
        tbody.querySelectorAll(".add-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                e.stopPropagation(); // don't open details
                const userId = button.dataset.id;
                const count = prompt("How many lessons to add?", "1");
                const numCount = Number(count);

                if (!Number.isInteger(numCount) || numCount <= 0) {
                    alert("Please enter a valid integer number");
                    return;
                }
                

                const res = await fetch(`/api/Users/${userId}/add-paid-lessons?count=${numCount}`, { method: "POST" });
                if (res.ok) {
                    const data = await res.json();
                    const span = document.querySelector(`#lessons-${userId}`);
                    if (span) span.textContent = data.paidLessons;
                } else {
                    alert("Failed to add lessons.");
                }
            });
        });

        // Close modal
        const closeBtn = document.getElementById("close-modal-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                const modal = document.getElementById("student-details-modal");
                if (modal) modal.classList.add("hidden");
            });
        }

        // Filter students
        document.getElementById("filter-input").addEventListener("input", function () {
            const value = this.value.toLowerCase();
            document.querySelectorAll("#student-table tbody tr").forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(value) ? "" : "none";
            });
        });

    } catch (err) {
        console.error("Error loading student list:", err);
        container.innerHTML = "<p>Error loading student list.</p>";
    }
}

// Function to open student details
async function openStudentDetails(userId) {
    console.log("openStudentDetails called with userId:", userId);
    const user = await getUserById(userId); // Fetch user details with counts
    if (!user) return;

    document.getElementById("modal-list-firstname").textContent = user.firstName || "";
    document.getElementById("modal-list-lastname").textContent = user.lastName || "";
    document.getElementById("modal-list-username").textContent = user.userName;
    document.getElementById("modal-list-email").textContent = user.email || "-";
    document.getElementById("modal-list-completed-lessons").textContent = user.completedLessonsCount ?? 0; // New lines
    document.getElementById("modal-list-scheduled-lessons").textContent = user.scheduledLessonsCount ?? 0; // New lines

    const modal = document.getElementById("student-details-modal");
    modal.classList.remove("hidden");

    // Reinitialize close button handler
    const closeBtn = document.getElementById("close-modal-btn");
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

        newCloseBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    }

    // Close modal when clicked outside
    const clickOutsideHandler = function (e) {
        if (!modal.contains(e.target) && !modal.classList.contains("hidden")) {
            modal.classList.add("hidden");
            document.removeEventListener("click", clickOutsideHandler);
        }
    };

    // Add event listener with a slight delay to prevent triggering on modal open
    setTimeout(() => {
        document.addEventListener("click", clickOutsideHandler);
    }, 100);
}
