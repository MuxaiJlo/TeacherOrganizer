using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    public class AdminLessonDetailsController : Controller
    {
        private readonly ILessonDetailsService _lessonDetailsService;

        public AdminLessonDetailsController(ILessonDetailsService lessonDetailsService)
        {
            _lessonDetailsService = lessonDetailsService;
        }

        // GET: /AdminLessonDetails
        public async Task<IActionResult> Index(string id, string lessonId, string createdAt, string updatedAt)
        {
            // Use the new method to get all lesson details for admin
            var allDetails = await _lessonDetailsService.GetAllAsync();

            if (!string.IsNullOrWhiteSpace(id))
                allDetails = allDetails.Where(ld => ld.LessonDetailsId.ToString().Contains(id.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(lessonId))
                allDetails = allDetails.Where(ld => ld.LessonId.ToString().Contains(lessonId.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(createdAt) && DateTime.TryParse(createdAt, out var createdDate))
                allDetails = allDetails.Where(ld => ld.CreatedAt.Date == createdDate.Date).ToList();

            if (!string.IsNullOrWhiteSpace(updatedAt) && DateTime.TryParse(updatedAt, out var updatedDate))
                allDetails = allDetails.Where(ld => ld.UpdatedAt.Date == updatedDate.Date).ToList();

            return View(allDetails);
        }

        // GET: /AdminLessonDetails/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var detail = await _lessonDetailsService.GetByIdAsync(id);
            if (detail == null)
                return NotFound();
            return View(detail);
        }

        // GET: /AdminLessonDetails/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: /AdminLessonDetails/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(LessonDetail model)
        {
            if (ModelState.IsValid)
            {
                // For demo, no accessible users
                await _lessonDetailsService.CreateAsync(model, new List<string>());
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // GET: /AdminLessonDetails/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            var detail = await _lessonDetailsService.GetByIdAsync(id);
            if (detail == null)
                return NotFound();
            return View(detail);
        }

        // POST: /AdminLessonDetails/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, LessonDetail model)
        {
            if (ModelState.IsValid)
            {
                model.LessonDetailsId = id;
                await _lessonDetailsService.UpdateAsync(model);
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // GET: /AdminLessonDetails/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            var detail = await _lessonDetailsService.GetByIdAsync(id);
            if (detail == null)
                return NotFound();
            return View(detail);
        }

        // POST: /AdminLessonDetails/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _lessonDetailsService.DeleteAsync(id);
            return RedirectToAction(nameof(Index));
        }
    }
}