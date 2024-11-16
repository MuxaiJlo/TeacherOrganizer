using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.Lessons;

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

            Console.WriteLine($"Getting calendar for user: {userId}, from {start} to {end}");

            var lessons = await _lessonService.GetLessonsForUserAsync(userId, start, end);

            Console.WriteLine($"Found {lessons.Count} lessons.");
            return Ok(lessons);
        }

        // GET: /api/Lesson
        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> AddLesson([FromBody] LessonModels newLesson)
        {
            Console.WriteLine("TeacherId: " + newLesson.TeacherId);
            Console.WriteLine("StartTime: " + newLesson.StartTime);
            Console.WriteLine("EndTime: " + newLesson.EndTime);
            Console.WriteLine("Description: " + newLesson.Description);
            Console.WriteLine("StudentIds: " + string.Join(", ", newLesson.StudentIds));
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdLesson = await _lessonService.AddLessonAsync(newLesson);

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
        [Authorize(Roles = "Teacher,Student")]
        public async Task<IActionResult> UpdateLesson(int lessonId, [FromBody] Models.DataModels.Lesson lessonUpdate)
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


        //POST: api/Lesson/{lessonId}/Reschedule
        [HttpPost("{lessonId}/Reschedule")]
        [Authorize(Roles = "Teacher,Student")]
        public async Task<IActionResult> ProposeReschedule(int lessonId, [FromBody] RescheduleRequest dto)
        {
            try
            {
                var request = new RescheduleRequest
                {
                    LessonId = lessonId,
                    ProposedStartTime = dto.ProposedStartTime,
                    ProposedEndTime = dto.ProposedEndTime,
                    InitiatorId = User.Identity?.Name,
                    RequestStatus = RescheduleRequestStatus.Pending
                };

                _context.RescheduleRequests.Add(request);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetLessonById), new { lessonId }, request);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

    }
}
