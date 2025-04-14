using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.CalendarModels;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.LessonModels;

namespace TeacherOrganizer.Controllers.Lesson
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly ILessonService _lessonService;
        private readonly ApplicationDbContext _context;

        public LessonController(ApplicationDbContext context, ILessonService lessonService)
        {
            _context = context;
            _lessonService = lessonService;
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


            Console.WriteLine($"===========================Getting calendar for user: {userId}, from {start} to {end}\"===========================");

            var lessons = await _lessonService.GetLessonsForUserAsync(userId, start, end);

            var events = lessons.Select(l => new
            {
                id = l.LessonId,
                title = l.Description,
                start = l.StartTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                end = l.EndTime.ToString("yyyy-MM-ddTHH:mm:ss")
            });

            Console.WriteLine($"\"=========================== Found {lessons.Count} lessons. \"===========================");
            return Ok(events);
        }

        // POST: /api/Lesson
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

                // Розбираємо токен і дістаємо id вчител
                var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (teacherId == null)
                {
                    return Unauthorized("Teacher ID not found in token.");
                }

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
                Console.Error.WriteLine($"Error creating lesson: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "An error occurred while creating the lesson.",
                    Details = ex.Message
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

            return Ok(updatedLesson);
        }

        // DELETE: api/Lesson/{lessonId}
        [HttpDelete("{lessonId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteLessonAsync(int lessonId)
        {
            var result = await _lessonService.DeleteLessonAsync(lessonId);
            if (!result) return NotFound(new { Message = "Lesson not found" });
            return NoContent();
        }

    }
}
