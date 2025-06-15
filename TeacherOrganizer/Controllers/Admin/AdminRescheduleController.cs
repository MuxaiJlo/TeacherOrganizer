using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.RescheduleModels;

namespace TeacherOrganizer.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    public class AdminRescheduleController : Controller
    {
        private readonly IRescheduleService _rescheduleService;

        public AdminRescheduleController(IRescheduleService rescheduleService)
        {
            _rescheduleService = rescheduleService;
        }

        // GET: /AdminReschedule
        public async Task<IActionResult> Index(string id, string lessonId, string initiator, string status, string proposedStart, string proposedEnd)
        {
            // For admin, get all requests (pending + others)
            // You may want to add a service method for all requests; for now, get pending for all users and filter
            var requests = await _rescheduleService.GetAllRequestsAsync();

            if (!string.IsNullOrWhiteSpace(id))
                requests = requests.Where(r => r.Id.ToString().Contains(id.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(lessonId))
                requests = requests.Where(r => r.LessonId.ToString().Contains(lessonId.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(initiator))
                requests = requests.Where(r => r.Initiator != null && (
                    r.Initiator.UserName?.Contains(initiator.Trim(), StringComparison.OrdinalIgnoreCase) == true ||
                    r.Initiator.FirstName?.Contains(initiator.Trim(), StringComparison.OrdinalIgnoreCase) == true ||
                    r.Initiator.LastName?.Contains(initiator.Trim(), StringComparison.OrdinalIgnoreCase) == true
                )).ToList();

            if (!string.IsNullOrWhiteSpace(status))
                requests = requests.Where(r => r.RequestStatus.ToString().Contains(status.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(proposedStart) && DateTime.TryParse(proposedStart, out var startDate))
                requests = requests.Where(r => r.ProposedStartTime.Date == startDate.Date).ToList();

            if (!string.IsNullOrWhiteSpace(proposedEnd) && DateTime.TryParse(proposedEnd, out var endDate))
                requests = requests.Where(r => r.ProposedEndTime.Date == endDate.Date).ToList();

            return View(requests);
        }

        // GET: /AdminReschedule/Details/5
        public async Task<IActionResult> Details(int id)
        {
            // For demo, get all pending and find by id
            var requests = await _rescheduleService.GetPendingRequestsForUserAsync("");
            var request = requests.FirstOrDefault(r => r.Id == id);
            if (request == null)
                return NotFound();
            return View(request);
        }

        // GET: /AdminReschedule/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            var requests = await _rescheduleService.GetPendingRequestsForUserAsync("");
            var request = requests.FirstOrDefault(r => r.Id == id);
            if (request == null)
                return NotFound();
            return View(request);
        }

        // POST: /AdminReschedule/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _rescheduleService.DeleteRescheduleRequestAsync(id);
            return RedirectToAction(nameof(Index));
        }
    }
}