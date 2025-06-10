using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Interfaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.LessonModels;

namespace TeacherOrganizer.Controllers.Lesson
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly ILessonService _lessonService;
        private readonly IEmailService _emailService;
        public LessonController(ILessonService lessonService, IEmailService emailService)
        {
            _lessonService = lessonService;
            _emailService = emailService;
        }
        // GET: /api/Lesson/{lessonId}
        [HttpGet("{lessonId}")]
        [Authorize(Roles = "Student,Teacher")]
        public async Task<IActionResult> GetLessonById(int lessonId)
        {
            var lesson = await _lessonService.GetLessonByIdAsync(lessonId);
            if (lesson == null)
            {
                return NotFound(new { Message = "Lesson not found" });
            }

            return Ok(new
            {
                LessonId = lesson.LessonId,
                Teacher = new { lesson.Teacher.Id, lesson.Teacher.UserName },
                Students = lesson.Students.Select(s => new { s.Id, s.UserName }),
                lesson.StartTime,
                lesson.EndTime,
                lesson.Description,
                lesson.Status
            });
        }

        // GET: /api/Lesson/Calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
        [HttpGet("Calendar")]
        [Authorize(Roles = "Student,Teacher")]
        public async Task<IActionResult> GetCalendar([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            var userId = User.Identity?.Name;

            if (start >= end)
                return BadRequest(new { Message = "Start date must be earlier than end date." });


            var lessons = await _lessonService.GetLessonsForUserAsync(userId, start, end);

            var events = lessons.Select(l => new
            {
                id = l.LessonId,
                title = l.Description,
                start = l.StartTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                end = l.EndTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                status = l.Status.ToString(),
                userName = string.Join(", ", l.Students.Select(s => s.UserName)), 
            });
            await _lessonService.AutoDeleteCanceledLessonsAsync();
            await _lessonService.AutoCompleteLessons();
            return Ok(events);
        }

        // POST: /api/lessons
        [HttpPost]
        [Authorize(Roles = "Teacher")] 
        public async Task<IActionResult> AddLesson([FromBody] LessonModelsInput newLesson)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (teacherId == null)
                {
                    return Unauthorized("Teacher ID not found in token.");
                }

                // Вытаскиваем имя преподавателя из токена, если есть, для письма
                var teacherFirstName = User.FindFirstValue(ClaimTypes.GivenName);
                var teacherUserName = User.FindFirstValue(ClaimTypes.Name);
                var teacherNameForEmail = !string.IsNullOrEmpty(teacherFirstName) ? teacherFirstName : teacherUserName;


                var lessonModel = new LessonModels
                {
                    TeacherId = teacherId,
                    StartTime = newLesson.StartTime,
                    EndTime = newLesson.EndTime,
                    Description = newLesson.Description,
                    Status = LessonStatus.Scheduled,
                    StudentIds = newLesson.StudentIds
                };

                var createdLesson = await _lessonService.AddLessonAsync(lessonModel);

                _emailService.SendLessonCreatedEmailAsync(createdLesson, teacherNameForEmail).Wait();
                return CreatedAtAction(nameof(GetLessonById), new { lessonId = createdLesson.LessonId }, new
                {
                    LessonId = createdLesson.LessonId,
                    Teacher = new { createdLesson.Teacher.Id, createdLesson.Teacher.UserName },
                    Students = createdLesson.Students.Select(s => new { s.Id, s.UserName }), 
                    createdLesson.StartTime,
                    createdLesson.EndTime,
                    createdLesson.Description,
                    createdLesson.Status
                });
            }
            catch (Exception ex)
            {
                // Логируем основную ошибку создания урока
                Console.Error.WriteLine($"ОШИБКА API: Ошибка при создании урока: {ex.Message}");
                // _logger?.LogError(ex, "Error creating lesson in API.");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "An error occurred while creating the lesson.",
                    Details = ex.Message // В продакшене лучше не выводить ex.Message напрямую клиенту
                });
            }
        }


        //PUT: api/Lesson/{lessonId}
        [HttpPut("{lessonId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateLesson(int lessonId, [FromBody] LessonUpdateModel lessonUpdate)
        {
            var updatedLesson = await _lessonService.UpdateLessonAsync(lessonId, lessonUpdate);
            if (updatedLesson == null) return NotFound(new { Message = "Lesson not found" });
            _emailService.SendLessonUpdatedEmailAsync(updatedLesson).Wait();
            return Ok(updatedLesson);
        }

        // DELETE: api/Lesson/{lessonId}
        [HttpDelete("{lessonId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteLessonAsync(int lessonId)
        {
            var result = await _lessonService.DeleteLessonAsync(lessonId);
            var lesson = await _lessonService.GetLessonByIdAsync(lessonId);
            if (!result || lesson == null) return NotFound(new { Message = "Lesson not found" });
            await _emailService.SendLessonDeletedEmailAsync(lesson);
            return NoContent();
        }

        [HttpPut("{lessonId}/cancel")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CancelLesson(int lessonId)
        {
            var result = await _lessonService.CancelLessonAsync(lessonId);
            var lesson = await _lessonService.GetLessonByIdAsync(lessonId);

            if (!result || lesson == null)
            {
                return BadRequest(new { Message = "Lesson not found or already canceled." });
            }

            await _emailService.SendLessonCanceledEmailAsync(lesson);
            return Ok(new { Message = "Lesson canceled successfully." });
        }


        [HttpGet("scheduled")]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<ActionResult<IEnumerable<LessonDto>>> GetScheduledLessons()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var lessons = await _lessonService.GetScheduledLessonsForUserAsync(userId);
            return Ok(lessons);
        }


    }
}
