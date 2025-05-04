export async function updateCalendarEvents(calendar, start, end) {
    try {
        // Create copies of dates to avoid modifying originals
        const startCopy = new Date(start);
        const endCopy = new Date(end);

        // Set time to midnight in local timezone
        startCopy.setHours(0, 0, 0, 0);
        endCopy.setHours(0, 0, 0, 0);

        // Format dates with timezone consideration
        const formattedStart = formatDateWithTimezone(startCopy);
        const formattedEnd = formatDateWithTimezone(endCopy);

        console.log("🛜 Actual API request dates:", formattedStart, formattedEnd);

        // Get all events
        const events = await fetchLessons(formattedStart, formattedEnd);
        console.log("📥 Received events:", events);

        // Filter events
        const filteredEvents = filterEventsByStatus(events);

        // Clear old events and add new ones
        calendar.getEvents().forEach(event => event.remove());

        // Add events with improved formatting
        calendar.addEventSource({
            events: filteredEvents,
            // Set default properties for all events
            textColor: '#000',
            borderWidth: 1,
            display: 'block'
        });

        // Force refresh to ensure proper rendering
        setTimeout(() => calendar.updateSize(), 100);

    } catch (error) {
        console.error("❌ Error fetching events:", error);
    }
}

// Format date with timezone consideration
function formatDateWithTimezone(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Enhanced filterEventsByStatus to improve event display
export function filterEventsByStatus(events) {
    // Get selected status
    const selectedStatus = document.getElementById("statusFilter")?.value || "all";

    // Filter if specific status selected
    let filtered = events;
    if (selectedStatus !== "all") {
        filtered = events.filter(ev => ev.status === selectedStatus);
    }

    // Enhanced event formatting with better title display
    return filtered.map(ev => {
        let color = "#3788d8"; // Default blue for Scheduled
        let textColor = "#fff";  // Default white text

        // Set colors based on status
        if (ev.status === "Canceled" || ev.status === 1) {
            color = "#dc3545"; // Red for canceled
        } else if (ev.status === "Completed" || ev.status === 2) {
            color = "#28a745"; // Green for completed
            textColor = "#000"; // Black text for better contrast on green
        } else if (ev.status === "RescheduledRequest" || ev.status === 3) {
            color = "#ffc107"; // Yellow for reschedule request
            textColor = "#000"; // Black text for better contrast on yellow
        }

        // Format time for better display
        let timeStr = "";
        if (ev.startTime) {
            const startTime = new Date(ev.startTime);
            timeStr = startTime.getHours().toString().padStart(2, '0') + ':' +
                startTime.getMinutes().toString().padStart(2, '0');
        }

        // Format title to ensure it fits
        let title = ev.title || ev.description || "Untitled";
        if (timeStr) {
            title = timeStr + ' - ' + title;
        }

        // Limit title length if too long
        if (title.length > 30) {
            title = title.substring(0, 27) + '...';
        }

        return {
            ...ev,
            title: title,
            backgroundColor: color,
            borderColor: color,
            textColor: textColor,
            classNames: ['calendar-event'],
            // Allow events to be higher to fit content
            extendedProps: {
                status: ev.status
            }
        };
    });
}