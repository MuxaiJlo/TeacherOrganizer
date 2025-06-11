using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.LessonModels;

namespace TeacherOrganizer.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminLessonController : Controller
    {
        private readonly ILessonService _lessonService;

        public AdminLessonController(ILessonService lessonService)
        {
            _lessonService = lessonService;
        }

        // GET: /AdminLesson
        public async Task<IActionResult> Index(string username, string id, string start, string end, string status, string description)
        {
            // Завантажити всі уроки з бази
            var lessons = await _lessonService.GetAllLessonsAsync();

            // Фільтр по датах (лише якщо вказано)
            if (DateTime.TryParse(start, out DateTime startDate))
            {
                lessons = lessons.Where(l => l.StartTime >= startDate).ToList();
            }

            if (DateTime.TryParse(end, out DateTime endDate))
            {
                lessons = lessons.Where(l => l.EndTime <= endDate).ToList();
            }

            // Фільтр по ID (часткове співпадіння)
            if (!string.IsNullOrWhiteSpace(id))
            {
                lessons = lessons.Where(l => l.LessonId.ToString().Contains(id.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Фільтр по статусу (наприклад, "Completed", "Cancelled")
            if (!string.IsNullOrWhiteSpace(status))
            {
                lessons = lessons.Where(l => l.Status != null && l.Status.ToString().Contains(status.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Фільтр по опису (часткове співпадіння)
            if (!string.IsNullOrWhiteSpace(description))
            {
                lessons = lessons.Where(l => !string.IsNullOrEmpty(l.Description) && l.Description.Contains(description.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Фільтр по імені викладача або студента
            if (!string.IsNullOrWhiteSpace(username))
            {
                string usernameLower = username.Trim().ToLower();
                lessons = lessons.Where(l =>
                    (l.Teacher?.UserName != null && l.Teacher.UserName.ToLower().Contains(usernameLower)) ||
                    (l.Students != null && l.Students.Any(s => s.UserName != null && s.UserName.ToLower().Contains(usernameLower)))
                ).ToList();
            }

            return View(lessons);
        }

        // GET: /AdminLesson/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var lesson = await _lessonService.GetLessonByIdAsync(id);
            if (lesson == null)
                return NotFound();
            return View(lesson);
        }

        // GET: /AdminLesson/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: /AdminLesson/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(LessonModels model)
        {
            if (ModelState.IsValid)
            {
                await _lessonService.AddLessonAsync(model);
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // GET: /AdminLesson/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            var lesson = await _lessonService.GetLessonByIdAsync(id);
            if (lesson == null)
                return NotFound();

            // Map Lesson to LessonUpdateModel
            var updateModel = new LessonUpdateModel
            {
                StartTime = lesson.StartTime,
                EndTime = lesson.EndTime,
                Description = lesson.Description,
                Status = lesson.Status
            };

            return View(updateModel);
        }

        // POST: /AdminLesson/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, LessonUpdateModel model)
        {
            if (ModelState.IsValid)
            {
                var updated = await _lessonService.UpdateLessonAsync(id, model);
                if (updated == null)
                    return NotFound();
                return RedirectToAction(nameof(Index));
            }
            return View(model);
        }

        // GET: /AdminLesson/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            var lesson = await _lessonService.GetLessonByIdAsync(id);
            if (lesson == null)
                return NotFound();
            return View(lesson);
        }

        // POST: /AdminLesson/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _lessonService.DeleteLessonAsync(id);
            return RedirectToAction(nameof(Index));
        }
    }
}