import { fetchStudents, getUserById } from "../api/api_user.js";
<<<<<<< HEAD
=======

>>>>>>> Bug
export async function initializeStudentList(container) {
    try {
        // Загружаем HTML-шаблон
        const html = await fetch("/modals/studentList.html").then(res => res.text());
        container.innerHTML = html;
<<<<<<< HEAD
        const students = await fetchStudents();
        const tbody = container.querySelector("#student-table tbody");
        students.forEach(student => {
            const row = document.createElement("tr");
=======

        const students = await fetchStudents();
        const tbody = container.querySelector("#student-table tbody");

        students.forEach(student => {
            const row = document.createElement("tr");

>>>>>>> Bug
            row.innerHTML = `
                <td>${student.firstName || ""}</td>
                <td>${student.lastName || ""}</td>
                <td>${student.userName}</td>
                <td><span id="lessons-${student.id}">${student.paidLessons ?? 0}</span></td>
<<<<<<< HEAD
                <td><button class="add-btn btn btn-primary btn-sm" data-id="${student.id}">➕</button></td>
            `;
=======
                <button class="add-btn btn btn-primary btn-sm" data-id="${student.id}">➕</button>
            `;

>>>>>>> Bug
            // По клику на строку — показать детали
            row.addEventListener("click", () => openStudentDetails(student.id));
            tbody.appendChild(row);
        });
<<<<<<< HEAD
=======

>>>>>>> Bug
        // Кнопки ➕ для добавления уроков
        tbody.querySelectorAll(".add-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                e.stopPropagation(); // не открывать детали
                const userId = button.dataset.id;
                const count = prompt("Сколько уроков добавить?", "1");
                if (!count || isNaN(count)) return;
<<<<<<< HEAD
=======

>>>>>>> Bug
                const res = await fetch(`/api/Users/${userId}/add-paid-lessons?count=${count}`, { method: "POST" });
                if (res.ok) {
                    const data = await res.json();
                    const span = document.querySelector(`#lessons-${userId}`);
                    if (span) span.textContent = data.paidLessons;
                } else {
                    alert("Не удалось пополнить уроки.");
                }
            });
        });

<<<<<<< HEAD
=======
        document.getElementById("close-modal-btn").addEventListener("click", () => {
            document.getElementById("student-details-modal").classList.add("hidden");
        });

>>>>>>> Bug
        document.getElementById("filter-input").addEventListener("input", function () {
            const value = this.value.toLowerCase();
            document.querySelectorAll("#student-table tbody tr").forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(value) ? "" : "none";
            });
        });
<<<<<<< HEAD
=======

>>>>>>> Bug
    } catch (err) {
        console.error("Ошибка загрузки student list:", err);
        container.innerHTML = "<p>Ошибка загрузки списка студентов.</p>";
    }
}

async function openStudentDetails(userId) {
<<<<<<< HEAD
    console.log("openStudentDetails called with userId:", userId);
    const user = await getUserById(userId);
    if (!user) return;

    document.getElementById("modal-list-firstname").textContent = user.firstName || "";
    document.getElementById("modal-list-lastname").textContent = user.lastName || "";
    document.getElementById("modal-list-username").textContent = user.userName;
    document.getElementById("modal-list-email").textContent = user.email || "-";

    const modal = document.getElementById("student-details-modal");
    modal.classList.remove("hidden");

    // Добавить обработчик для кнопки закрытия здесь
    const closeBtn = document.getElementById("close-modal-btn");
    if (closeBtn) {
        // Удаляем старые обработчики, чтобы избежать дублирования
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        document.getElementById("close-modal-btn").addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    }

    // Также добавим возможность закрытия по клику вне модального окна
    document.addEventListener("click", function closeModal(e) {
        if (!modal.contains(e.target) && !modal.classList.contains("hidden")) {
            modal.classList.add("hidden");
            document.removeEventListener("click", closeModal);
        }
    });
}
=======
    const user = await getUserById(userId);
    if (!user) return;

    document.getElementById("modal-firstname").textContent = user.firstName || "";
    document.getElementById("modal-lastname").textContent = user.lastName || "";
    document.getElementById("modal-username").textContent = user.userName;
    document.getElementById("modal-email").textContent = user.email || "-";


    const modal = document.getElementById("student-details-modal");
    modal.classList.remove("hidden");
}

>>>>>>> Bug
