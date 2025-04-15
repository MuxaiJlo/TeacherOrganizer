using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.CalendarModels;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.LessonModels;

namespace TeacherOrganizer.Servies
{
    public class LessonService : ILessonService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public LessonService(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<Lesson> AddLessonAsync(LessonModels lessonDto)
        {
            Console.WriteLine($"🔍 Searching for teacher with ID: {lessonDto.TeacherId}");

            var teacher = await _userManager.FindByNameAsync(lessonDto.TeacherId);

            Console.WriteLine($"Searching for teacher with ID after FindByNameAsync: {teacher}");
            if (teacher == null)
                throw new Exception("Teacher not found");

            var students = await _context.Users
                .Where(u => lessonDto.StudentIds.Contains(u.Id))
                .ToListAsync();

            if (students.Count != lessonDto.StudentIds.Distinct().Count())
                throw new Exception("One or more students not found");

            var lesson = new Lesson
            {
                Teacher = teacher,
                StartTime = lessonDto.StartTime,
                EndTime = lessonDto.EndTime,
                Description = lessonDto.Description,
                Status = LessonStatus.Scheduled,
                Students = students
            };

            await _context.Lessons.AddAsync(lesson);
            await _context.SaveChangesAsync();

            return lesson;
        }


        public async Task<bool> DeleteLessonAsync(int lessonId)
        {
            var lesson = await _context.Lessons.FindAsync(lessonId);
            if (lesson == null) return false;
            Console.WriteLine($"=====================Lesson: {lesson}=======================");

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Lesson>> GetLessonsForUserAsync(string userId, DateTime start, DateTime end)
        {
            var query = _context.Lessons
                .Include(l => l.Teacher)
                .Include(l => l.Students)
                .Where(l => l.StartTime >= start && l.EndTime <= end)
                .Where(l => l.Teacher.UserName == userId || l.Students.Any(s => s.UserName == userId));

            return await query.ToListAsync();
        }


        public async Task<Lesson?> ProposeRescheduleAsync(int lessonId, DateTime proposedStart, DateTime proposedEnd, string initiatorId)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Teacher)
                .Include(l => l.Students)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId);

            if (lesson == null) return null;

            var initiator = await _context.Users.FirstOrDefaultAsync(u => u.UserName == initiatorId);
            if (initiator == null)
            {
                Console.WriteLine($"Initiator with ID '{initiatorId}' not found in the database.");
                throw new UnauthorizedAccessException("Initiator not found");
            }

            // Создаём запрос на перенос
            var rescheduleRequest = new RescheduleRequest
            {
                Lesson = lesson,
                Initiator = initiator,
                InitiatorId = initiatorId,
                ProposedStartTime = proposedStart,
                ProposedEndTime = proposedEnd,
                RequestStatus = RescheduleRequestStatus.Pending
            };

            _context.RescheduleRequests.Add(rescheduleRequest);

            // ⬇ Меняем статус урока
            lesson.Status = LessonStatus.RescheduledRequest;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return lesson;
        }

        public async Task AutoCompleteLessons()
        {
            var now = DateTime.UtcNow;

            var lessonsToComplete = await _context.Lessons
                .Include(l => l.Students)
                .Where(l => l.EndTime <= now && l.Status == LessonStatus.Scheduled)
                .ToListAsync();

            foreach (var lesson in lessonsToComplete)
            {
                lesson.Status = LessonStatus.Completed;
                foreach (var student in lesson.Students)
                {
                    if (student.PaidLessons > 0)
                    {
                        student.PaidLessons -= 1;
                    }
                    else
                    {
                        Console.WriteLine($"Student {student.UserName} has no paid lessons left!");
                    }
                }
            }

            await _context.SaveChangesAsync();
        }


        public async Task<Lesson> UpdateLessonAsync(int lessonId, LessonUpdateModel updatedLesson)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Teacher)
                .Include(l => l.Students)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId);

            if (lesson == null) return null;

            lesson.StartTime = updatedLesson.StartTime;
            lesson.EndTime = updatedLesson.EndTime;
            lesson.Description = updatedLesson.Description;
            lesson.Status = LessonStatus.Scheduled;

            await _context.SaveChangesAsync();
            return lesson;
        }
        public async Task<Lesson?> GetLessonByIdAsync(int lessonId)
        {
            return await _context.Lessons
                .Include(l => l.Teacher)
                .Include(l => l.Students)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId);
        }

    }
}
