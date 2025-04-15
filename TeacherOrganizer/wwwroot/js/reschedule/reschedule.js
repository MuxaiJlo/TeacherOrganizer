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

        function updateTable(requests) {
            const currentUserName = window.currentUserName;
            let filteredRequests = [...requests];

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

            table.querySelectorAll(".approve-btn").forEach(btn => btn.addEventListener("click", handleApprove));
            table.querySelectorAll(".reject-btn").forEach(btn => btn.addEventListener("click", handleReject));
            table.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", handleEdit));
        }

        filterStartDateInput.addEventListener("change", () => updateTable(requests));
        filterEndDateInput.addEventListener("change", () => updateTable(requests));
        filterUsernameInput.addEventListener("input", () => updateTable(requests));

        let editingRow = null; 

        function handleEdit(e) {
            const row = e.target.closest("tr");
            editingRow = row; 
            const requestId = row.getAttribute("data-id");
            const startTimeValue = row.getAttribute("proposed-start-time");
            const endTimeValue = row.getAttribute("proposed-end-time");

            const editStartTimeInput = document.getElementById("editStartTime");
            const editEndTimeInput = document.getElementById("editEndTime");
            editStartTimeInput.value = "";
            editEndTimeInput.value = "";

            editStartTimeInput.value = startTimeValue;
            editEndTimeInput.value = endTimeValue;

            const editModal = new bootstrap.Modal(document.getElementById('editRescheduleModal'));
            editModal.show();

            document.getElementById("saveEditButton").onclick = async () => {
                const startTime = document.getElementById("editStartTime").value;
                const endTime = document.getElementById("editEndTime").value;

                if (!startTime || !endTime) {
                    alert("Please fill in both date fields");
                    return;
                }

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

                    editingRow.setAttribute("data-original-start-time", startTime);
                    editingRow.setAttribute("data-original-end-time", endTime);

                    updateTable(requests);
                    alert("Reschedule request updated successfully!");
                    editModal.hide(); 
                } catch (error) {
                    console.error("Error updating reschedule request:", error);
                    alert("Failed to update reschedule request");
                }
            };
        }

        async function handleApprove(e) {
            const row = e.target.closest("tr");
            const requestId = row.getAttribute("data-id");
            const lessonId = row.getAttribute("data-lesson-id");

            try {
                await updateRescheduleRequestStatus(requestId, 1);

                alert("Reschedule request approved!"); 

                row.remove();

                if (typeof updateCalendar === 'function') {
                    updateCalendar();
                }
            } catch (error) {
                console.error("Error approving request:", error);
                alert("Failed to approve the request.");
                showNotification("Failed to approve the request.", "error");
            }
        }

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