import {
    fetchPendingRescheduleRequests,
    updateRescheduleRequestStatus,
    updateRescheduleRequest,
} from "../api/api_reschedule.js";

export async function initializeRescheduleRequests(container) {
    container.innerHTML = `
  <h2>Reschedule Requests</h2>
  <div id="reschedule-table-wrapper">Loading...</div>
  `;

    let table;

    try {
        const requests = await fetchPendingRescheduleRequests();
        const currentUserName = window.currentUserName;

        const tableWrapper = document.getElementById("reschedule-table-wrapper");
        if (requests.length === 0) {
            tableWrapper.innerHTML = "<p>No reschedule requests found.</p>";
            return;
        }

        table = document.createElement("table");
        table.classList.add("reschedule-table");

        table.innerHTML = `
  <thead>
    <tr>
      <th>Lesson Date</th>
      <th>Username</th>
      <th>Requested New Date</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    ${requests
                .map(
                    (r) => `
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
            <button class="approve-btn">Approve</button>
            <button class="reject-btn">Reject</button>
            <button class="edit-btn">Edit</button>
          `
                            : `<span class="text-muted">Waiting for response</span>`
                        }
      </td>
    </tr>
    `
                )
                .join("")}
  </tbody>
  `;

        tableWrapper.innerHTML = "";
        tableWrapper.appendChild(table);

        // Обработчики событий для кнопок
        table.querySelectorAll(".approve-btn").forEach((btn) =>
            btn.addEventListener("click", handleApprove)
        );

        table.querySelectorAll(".reject-btn").forEach((btn) =>
            btn.addEventListener("click", handleReject)
        );

        table.querySelectorAll(".edit-btn").forEach((btn) =>
            btn.addEventListener("click", handleEdit)
        );

    } catch (error) {
        console.error("Error loading reschedule requests:", error);
        container.innerHTML = "<p>Error loading reschedule requests.</p>";
        return;
    }

    // Функция для обработки Edit
    function handleEdit(e) {
        const row = e.target.closest("tr");
        const actionsCell = row.querySelector(".action-cell");
        const requestedDateCell = row.querySelector(".requested-date-cell");

        // Сохраняем оригинальные значения
        const startTimeValue = row.getAttribute("data-original-start-time");
        const endTimeValue = row.getAttribute("data-original-end-time");

        // Заменяем кнопки на Save/Cancel
        actionsCell.innerHTML = `
            <button class="save-btn" title="Save">✓</button>
            <button class="cancel-btn" title="Cancel">✗</button>
        `;

        // Заменяем текст на поля ввода
        requestedDateCell.innerHTML = `
            <input type="datetime-local" class="edit-start-time" value="${startTimeValue}"><br>
            <input type="datetime-local" class="edit-end-time" value="${endTimeValue}">
        `;

        // Добавляем обработчики для новых кнопок
        actionsCell.querySelector(".save-btn").addEventListener("click", handleSave);
        actionsCell.querySelector(".cancel-btn").addEventListener("click", handleCancel);
    }

    // Функция для обработки сохранения
    async function handleSave(e) {
        const row = e.target.closest("tr");
        const requestId = row.getAttribute("data-id");
        const requestedDateCell = row.querySelector(".requested-date-cell");

        const startTimeInput = requestedDateCell.querySelector(".edit-start-time");
        const endTimeInput = requestedDateCell.querySelector(".edit-end-time");

        if (!startTimeInput || !endTimeInput) {
            console.error("Cannot find date inputs");
            return;
        }

        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

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
            });

            // Обновляем атрибуты строки
            row.setAttribute("data-original-start-time", startTime);
            row.setAttribute("data-original-end-time", endTime);

            // Восстанавливаем отображение и кнопки
            restoreRowDisplay(row);
        } catch (error) {
            console.error("Error updating reschedule request:", error);
            alert("Failed to update reschedule request");
        }
    }

    // Функция для обработки отмены
    function handleCancel(e) {
        const row = e.target.closest("tr");
        restoreRowDisplay(row);
    }

    // Восстановление отображения строки
    function restoreRowDisplay(row) {
        const requestedDateCell = row.querySelector(".requested-date-cell");
        const actionsCell = row.querySelector(".action-cell");
        const initiator = row.getAttribute("data-initiator");
        const currentUserName = window.currentUserName;

        // Получаем оригинальные значения
        const startTimeValue = row.getAttribute("data-original-start-time");
        const endTimeValue = row.getAttribute("data-original-end-time");

        // Восстанавливаем отображение дат
        const formattedStartTime = new Date(startTimeValue).toLocaleString();
        const formattedEndTime = new Date(endTimeValue).toLocaleString();

        requestedDateCell.innerHTML = `
            <span class="proposed-start-time">${formattedStartTime}</span><br>
            <span class="proposed-end-time">${formattedEndTime}</span>
        `;

        // Восстанавливаем кнопки действий
        if (initiator !== currentUserName) {
            actionsCell.innerHTML = `
                <button class="approve-btn">Approve</button>
                <button class="reject-btn">Reject</button>
                <button class="edit-btn">Edit</button>
            `;

            // Добавляем обработчики событий для кнопок
            actionsCell.querySelector(".approve-btn").addEventListener("click", handleApprove);
            actionsCell.querySelector(".reject-btn").addEventListener("click", handleReject);
            actionsCell.querySelector(".edit-btn").addEventListener("click", handleEdit);
        } else {
            actionsCell.innerHTML = `<span class="text-muted">Waiting for response</span>`;
        }
    }

    // Функция для одобрения запроса
    async function handleApprove(e) {
        const row = e.target.closest("tr");
        const requestId = row.getAttribute("data-id");

        try {
            await updateRescheduleRequestStatus(requestId, "Approved");
            row.remove();
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Failed to approve the request.");
        }
    }

    // Функция для отклонения запроса
    async function handleReject(e) {
        const row = e.target.closest("tr");
        const requestId = row.getAttribute("data-id");

        try {
            await updateRescheduleRequestStatus(requestId, "Rejected");
            row.remove();
        } catch (error) {
            console.error("Error rejecting request:", error);
            alert("Failed to reject the request.");
        }
    }
}