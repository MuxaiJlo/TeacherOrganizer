import { fetchStudents, getUserById } from "../api/api_user.js";
export async function initializeStudentList(container) {
    try {
        // Загружаем HTML-шаблон
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

            // По клику на строку — показать детали
            row.addEventListener("click", () => openStudentDetails(student.id));
            tbody.appendChild(row);
        });

        // Кнопки ➕ для добавления уроков
        tbody.querySelectorAll(".add-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                e.stopPropagation(); // не открывать детали
                const userId = button.dataset.id;
                const count = prompt("Сколько уроков добавить?", "1");
                if (!count || isNaN(count)) return;

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

        // Инициализация обработчика закрытия модального окна
        const closeBtn = document.getElementById("close-modal-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                const modal = document.getElementById("student-details-modal");
                if (modal) modal.classList.add("hidden");
            });
        }

        document.getElementById("filter-input").addEventListener("input", function () {
            const value = this.value.toLowerCase();
            document.querySelectorAll("#student-table tbody tr").forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(value) ? "" : "none";
            });
        });

    } catch (err) {
        console.error("Ошибка загрузки student list:", err);
        container.innerHTML = "<p>Ошибка загрузки списка студентов.</p>";
    }
} // Добавлена закрывающая скобка для функции initializeStudentList

async function openStudentDetails(userId) {
    console.log("openStudentDetails called with userId:", userId);
    const user = await getUserById(userId);
    if (!user) return;

    // Обратите внимание на правильные ID, соответствующие вашему HTML
    document.getElementById("modal-list-firstname").textContent = user.firstName || "";
    document.getElementById("modal-list-lastname").textContent = user.lastName || "";
    document.getElementById("modal-list-username").textContent = user.userName;
    document.getElementById("modal-list-email").textContent = user.email || "-";

    const modal = document.getElementById("student-details-modal");
    modal.classList.remove("hidden");

    // Переинициализация обработчика кнопки закрытия
    const closeBtn = document.getElementById("close-modal-btn");
    if (closeBtn) {
        // Удаляем старые обработчики, чтобы избежать дублирования
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

        newCloseBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    }

    // Добавляем возможность закрытия по клику вне модального окна
    const clickOutsideHandler = function (e) {
        if (!modal.contains(e.target) && !modal.classList.contains("hidden")) {
            modal.classList.add("hidden");
            document.removeEventListener("click", clickOutsideHandler);
        }
    };

    // Добавляем обработчик с небольшой задержкой, чтобы избежать срабатывания при открытии
    setTimeout(() => {
        document.addEventListener("click", clickOutsideHandler);
    }, 100);
}