using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Interfaces;
using TeacherOrganizer.Models.CalendarModels;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.LessonModels;
using TeacherOrganizer.Services;

namespace TeacherOrganizer.Controllers.Lesson
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly ILessonService _lessonService;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IUserService _userService;

        public LessonController(ApplicationDbContext context, ILessonService lessonService, IEmailService emailService, IUserService userService)
        {
            _context = context;
            _lessonService = lessonService;
            _emailService = emailService;
            _userService = userService;
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
                end = l.EndTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                status = l.Status.ToString(),
                userName = string.Join(", ", l.Students.Select(s => s.UserName)), 
            });
            await _lessonService.AutoDeleteCanceledLessonsAsync();
            await _lessonService.AutoCompleteLessons();
            Console.WriteLine($"\"=========================== Found {lessons.Count} lessons. \"===========================");
            return Ok(events);
        }

        // POST: /api/lessons
        [HttpPost]
        [Authorize(Roles = "Teacher")] // Убедитесь, что у вас есть роль Teacher или измените на нужную
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
                    Status = LessonStatus.Scheduled, // Убедитесь, что LessonStatus это ваш enum/класс
                    StudentIds = newLesson.StudentIds
                };

                var createdLesson = await _lessonService.AddLessonAsync(lessonModel);

                // --- Начало логики отправки Email уведомлений ---
                if (createdLesson.Students != null && createdLesson.Students.Any())
                {
                    // Если имя преподавателя из токена не удалось получить, используем UserName из созданного урока
                    if (string.IsNullOrEmpty(teacherNameForEmail) && createdLesson.Teacher != null)
                    {
                        teacherNameForEmail = createdLesson.Teacher.UserName;
                    }
                    teacherNameForEmail = teacherNameForEmail ?? "Ваш преподаватель";


                    foreach (var studentInfo in createdLesson.Students) // studentInfo должен содержать Id студента
                    {
                        try
                        {
                            // Получаем полную информацию о студенте, включая Email
                            var student = await _userService.GetUserByIdAsync(studentInfo.Id);

                            if (student != null && !string.IsNullOrEmpty(student.Email))
                            {
                                var subject = $"Новый урок: {createdLesson.Description ?? "Без темы"}";
                                var messageBody = $"Здравствуйте, {student.FirstName ?? student.UserName}!<br><br>" +
                                                  $"Для вас запланирован новый урок: <strong>{createdLesson.Description ?? "Без темы"}</strong>.<br>" +
                                                  $"Дата и время: {createdLesson.StartTime:dd.MM.yyyy HH:mm} - {createdLesson.EndTime:HH:mm}.<br><br>" +
                                                  $"С уважением,<br>{teacherNameForEmail}";

   
                                _emailService.SendEmailAsync(student.Email, subject, messageBody) 

                                    .ContinueWith(task => {
                                        if (task.IsFaulted)
                                        {
                                            Console.Error.WriteLine($"ОШИБКА EMAIL: Не удалось отправить уведомление о создании урока студенту {student.Email}. Ошибка: {task.Exception?.GetBaseException().Message}");
                                            
                                        }
                                        else
                                        {
                                            Console.WriteLine($"EMAIL УСПЕХ: Уведомление о создании урока успешно отправлено студенту {student.Email}.");
                                            
                                        }
                                    }, TaskScheduler.Default); 
                            }
                            else if (student != null)
                            {
                                Console.WriteLine($"ПРЕДУПРЕЖДЕНИЕ EMAIL: Студент {student.UserName} (ID: {studentInfo.Id}) не имеет email адреса. Уведомление не отправлено.");
                                
                            }
                            else
                            {
                                Console.WriteLine($"ПРЕДУПРЕЖДЕНИЕ EMAIL: Студент с ID {studentInfo.Id} не найден. Уведомление не отправлено.");
                                
                            }
                        }
                        catch (Exception exInLoop)
                        {
                            // Логируем ошибку, возникшую при получении данных студента или подготовке письма
                            Console.Error.WriteLine($"ОШИБКА EMAIL (Подготовка): Произошла ошибка при подготовке уведомления для студента ID {studentInfo.Id}: {exInLoop.Message}");
                            
                        }
                    }
                }
                // --- Конец логики отправки Email уведомлений ---

                return CreatedAtAction(nameof(GetLessonById), new { lessonId = createdLesson.LessonId }, new
                {
                    LessonId = createdLesson.LessonId,
                    Teacher = new { createdLesson.Teacher.Id, createdLesson.Teacher.UserName },
                    Students = createdLesson.Students.Select(s => new { s.Id, s.UserName }), // Убедитесь, что эти поля существуют
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

        [HttpPut("{lessonId}/cancel")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CancelLesson(int lessonId)
        {
            var result = await _lessonService.CancelLessonAsync(lessonId);
            if (!result)
                return BadRequest(new { Message = "Lesson not found or already canceled." });

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
