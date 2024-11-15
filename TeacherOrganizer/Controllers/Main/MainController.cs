using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.CalendarModels;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.Lessons;
using TeacherOrganizer.Models.ViewModels;

namespace TeacherOrganizer.Controllers.Main
{
	[Route("api/[controller]")]
	[ApiController]
	public class MainController : ControllerBase
	{
		private readonly UserManager<User> _userManager;
		private readonly ILessonService _lessonService;
        private readonly ApplicationDbContext _context;

        public MainController(UserManager<User> userManager, ILessonService lessonService, ApplicationDbContext context)
		{
			_userManager = userManager;
			_lessonService = lessonService;
            _context = context;
		}

		[HttpGet("index")]
		[Authorize(Roles = "Student,Teacher")]
		public async Task<IActionResult> Index()
		{
			var userName = User.Identity?.Name;

			var user = await _userManager.FindByNameAsync(userName);
			if (user == null)
			{
				Console.WriteLine("User not found or unauthorized");
				Console.WriteLine($"Username: {userName}");
				foreach (var claim in User.Claims)
				{
					Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}");
				}

				var errorDetails = new
				{
					Message = "User not found or not authorized.",
					Username = userName,
					Claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
				};

				return Unauthorized(errorDetails);
			}

			var roles = await _userManager.GetRolesAsync(user);
			Console.WriteLine("User authorized successfully");
			Console.WriteLine($"Username: {user.UserName}, Email: {user.Email}, Roles: {string.Join(", ", roles)}");

			var model = new MainViewModel
			{
				Username = user.UserName,
				LoginTime = DateTime.UtcNow
			};

			return Ok(new
			{
				Message = "You have passed the bearer authentication.",
				UserInfo = new
				{
					Username = user.UserName,
					Email = user.Email,
					Roles = roles
				}
			});
		}

        [HttpGet("GetLesson/{lessonId}")]
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


        // GET: api/Main/Calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
        [HttpGet("Calendar")]
		[Authorize(Roles = "Student,Teacher")]
		public async Task<IActionResult> GetCalendar([FromQuery] DateTime start, [FromQuery] DateTime end)
		{
			var userId = User.Identity?.Name;
			var lessons = await _lessonService.GetLessonsForUserAsync(userId, start, end);
			return Ok(lessons);
		}

        // GET: api/Main/Lesson
        [HttpPost("Lesson")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> AddLesson([FromBody] LessonModels newLesson)
        {
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


        //PUT: api/Main/Lesson/{lessonId}
        [HttpPut("Lesson/{lessonId}")]
		[Authorize(Roles = "Teacher,Student")]
		public async Task<IActionResult> UpdateLesson(int lessonId, [FromBody] Models.DataModels.Lesson lessonUpdate)
		{
			var updatedLesson = await _lessonService.UpdateLessonAsync(lessonId, lessonUpdate);
			if (updatedLesson == null) return NotFound(new { Message = "Lesson not found" });

			return Ok(updatedLesson);
		}

		// DELETE: api/Main/Lesson/{lessonId}
		[HttpDelete("Lesson/{lessonId}")]
		[Authorize(Roles = "Teacher")]
        public async Task<bool> DeleteLessonAsync(int lessonId)
        {
            var lesson = await _context.Lessons.FindAsync(lessonId);
            if (lesson == null) return false;

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();
            return true;
        }


        //POST: api/Main/Lesson/{lessonId}/Reschedule
        [HttpPost("Lesson/{lessonId}/Reschedule")]
		[Authorize(Roles = "Teacher,Student")]
		public async Task<IActionResult> ProposedReschedule(int lessonId, [FromBody] RescheduleRequest request)
        {
            var rescheduledLesson = await _lessonService.ProposeRescheduleAsync(lessonId, request.ProposedStartTime, request.ProposedEndTime);
            if (rescheduledLesson == null)
                return NotFound(new { Message = "Lesson not found." });

            return Ok(rescheduledLesson);
        }
    }
}
