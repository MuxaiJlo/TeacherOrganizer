using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TeacherOrganizer.Controllers.Lesson
{
    [Route("LessonView")]
    public class LessonViewController : Controller
    {
        [HttpGet("Calendar")]
        [Authorize(Roles = "Student, Teacher")]
        public IActionResult Calendar()
        {
            return View("CalendarView");
        }
    }
}
