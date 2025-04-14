import {
    fetchPendingRescheduleRequests,
    updateRescheduleRequestStatus,
    updateRescheduleRequest,
} from "../api/api_reschedule.js";

export async function initializeRescheduleRequests(container) {
    try {
        const response = await fetch('/modals/reschedule.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        container.innerHTML = await response.text();

        const table = container.querySelector(".reschedule-table tbody");
        const filterStartDateInput = document.getElementById("filterStartDate");
        const filterEndDateInput = document.getElementById("filterEndDate");
        const filterUsernameInput = document.getElementById("filterUsername");

        let requests = [];

        try {
            requests = await fetchPendingRescheduleRequests();
            updateTable(requests);
        } catch (error) {
            console.error("Error loading reschedule requests:", error);
            table.innerHTML = '<tr><td colspan="4">Error loading reschedule requests.</td></tr>';
            return;
        }

        // Функция для обновления таблицы (остается без изменений)
        function updateTable(requests) {
            const currentUserName = window.currentUserName;
            let filteredRequests = [...requests];

            // Применяем фильтры
            if (filterStartDateInput.value) {
                filteredRequests = filteredRequests.filter(r => new Date(r.lesson.startTime) >= new Date(filterStartDateInput.value));
            }
            if (filterEndDateInput.value) {
                filteredRequests = filteredRequests.filter(r => new Date(r.lesson.startTime) <= new Date(filterEndDateInput.value));
            }
            if (filterUsernameInput.value) {
                filteredRequests = filteredRequests.filter(r => r.initiator?.userName?.toLowerCase().includes(filterUsernameInput.value.toLowerCase()));
            }

            table.innerHTML = filteredRequests.map(r => `
                <tr data-id="${r.id}"
                    data-original-start-time="${new Date(r.proposedStartTime).toISOString().slice(0, 16)}"
                    data-original-end-time="${new Date(r.proposedEndTime).toISOString().slice(0, 16)}"
                    data-initiator="${r.initiator?.userName || "Unknown"}">
                    <td>
                        ${new Date(r.lesson.startTime).toLocaleString()}<br />
                        ${new Date(r.lesson.endTime).toLocaleString()}
                    </td>
                    <td>${r.initiator?.userName || "Unknown"}</td>
                    <td class="requested-date-cell">
                        <span class="proposed-start-time">
                            ${new Date(r.proposedStartTime).toLocaleString()}
                        </span>
                        <br />
                        <span class="proposed-end-time">
                            ${new Date(r.proposedEndTime).toLocaleString()}
                        </span>
                    </td>
                    <td class="action-cell">
                        ${r.initiator?.userName !== currentUserName
                    ? `
                                <button class="approve-btn btn btn-success">Approve</button>
                                <button class="reject-btn btn btn-danger">Reject</button>
                                <button class="edit-btn btn btn-primary">Edit</button>
                            `
                    : `<span class="text-muted">Waiting for response</span>`
                }
                    </td>
                </tr>
            `).join('');

            // Добавляем обработчики событий
            table.querySelectorAll(".approve-btn").forEach(btn => btn.addEventListener("click", handleApprove));
            table.querySelectorAll(".reject-btn").forEach(btn => btn.addEventListener("click", handleReject));
            table.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", handleEdit));
        }

        // Обработчики событий для фильтров
        filterStartDateInput.addEventListener("change", () => updateTable(requests));
        filterEndDateInput.addEventListener("change", () => updateTable(requests));
        filterUsernameInput.addEventListener("input", () => updateTable(requests));

        let editingRow = null; // Переменная для хранения редактируемой строки

        // Функция для обработки Edit (остается почти без изменений)
        // Функция для обработки Edit
        function handleEdit(e) {
            const row = e.target.closest("tr");
            editingRow = row; // Сохраняем ссылку на редактируемую строку
            const requestId = row.getAttribute("data-id");
            const startTimeValue = row.getAttribute("proposed-start-time");
            const endTimeValue = row.getAttribute("proposed-end-time");

            // Очищаем поля модального окна перед заполнением
            const editStartTimeInput = document.getElementById("editStartTime");
            const editEndTimeInput = document.getElementById("editEndTime");
            editStartTimeInput.value = "";
            editEndTimeInput.value = "";

            // Заполняем модальное окно данными
            editStartTimeInput.value = startTimeValue;
            editEndTimeInput.value = endTimeValue;

            // Показываем модальное окно
            const editModal = new bootstrap.Modal(document.getElementById('editRescheduleModal'));
            editModal.show();

            // Обработчик для кнопки Save в модальном окне
            document.getElementById("saveEditButton").onclick = async () => {
                const startTime = document.getElementById("editStartTime").value;
                const endTime = document.getElementById("editEndTime").value;

                if (!startTime || !endTime) {
                    alert("Please fill in both date fields");
                    return;
                }

                // Проверка валидности дат
                const startDate = new Date(startTime);
                const endDate = new Date(endTime);

                if (isNaN(startDate) || isNaN(endDate)) {
                    alert("Invalid date format");
                    return;
                }

                if (startDate >= endDate) {
                    alert("End time must be after start time");
                    return;
                }

                try {
                    await updateRescheduleRequest(requestId, {
                        proposedStartTime: startTime,
                        proposedEndTime: endTime,
                        newInitiatorId: window.currentUserName
                    });

                    // Обновляем атрибуты строки
                    editingRow.setAttribute("data-original-start-time", startTime);
                    editingRow.setAttribute("data-original-end-time", endTime);

                    // Обновляем отображение в таблице
                    updateTable(requests);
                    alert("Reschedule request updated successfully!");
                    editModal.hide(); // Скрываем модальное окно
                } catch (error) {
                    console.error("Error updating reschedule request:", error);
                    alert("Failed to update reschedule request");
                }
            };
        }

        // Функция для одобрения запроса
        async function handleApprove(e) {
            const row = e.target.closest("tr");
            const requestId = row.getAttribute("data-id");
            const lessonId = row.getAttribute("data-lesson-id");

            try {
                // Запрос на обновление статуса (бэкенд обновит время урока автоматически)
                await updateRescheduleRequestStatus(requestId, 1);

                // Показываем сообщение об успехе
                alert("Reschedule request approved!"); // Алерт про схвалення

                // Удаляем строку из таблицы
                row.remove();

                // При необходимости можно обновить календарь, если он есть на странице
                if (typeof updateCalendar === 'function') {
                    updateCalendar();
                }
            } catch (error) {
                console.error("Error approving request:", error);
                alert("Failed to approve the request.");
                showNotification("Failed to approve the request.", "error");
            }
        }

        // Функция для отклонения запроса
        async function handleReject(e) {
            const row = e.target.closest("tr");
            const requestId = row.getAttribute("data-id");

            try {
                await updateRescheduleRequestStatus(requestId, 2);
                alert("Reschedule request rejected.");
                row.remove();
            } catch (error) {
                alert("Failed to reject the request.");
                console.error("Error rejecting request:", error);
                showNotification("Failed to reject the request.", "error");
            }
        }
    } catch (error) {
        console.error("Error initializing:", error);
        container.innerHTML = `<p>Could not load reschedule interface.</p>`;
    }
}