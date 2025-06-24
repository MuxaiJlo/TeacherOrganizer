using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
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
        public async Task<List<Lesson>> GetAllLessonsAsync()
        {
            return await _context.Lessons
                .Include(l => l.Teacher)
                .Include(l => l.Students)
                .ToListAsync();
        }
        public async Task<Lesson> AddLessonAsync(LessonModels lessonDto)
        {
            var teacher = await _userManager.FindByNameAsync(lessonDto.TeacherId);
            if (teacher == null)
                throw new ArgumentException("Teacher not found");

            var students = await _context.Users
                .Where(u => lessonDto.StudentIds.Contains(u.Id))
                .ToListAsync();

            if (students.Count != lessonDto.StudentIds.Distinct().Count())
                throw new ArgumentException("One or more students not found");

            await ValidateLessonDto(lessonDto, teacher, students);

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

        public async Task<Lesson> UpdateLessonAsync(int lessonId, LessonUpdateModel updatedLesson)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Teacher)
                .Include(l => l.Students)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId);

            if (lesson == null)
                return null;

            var tempDto = new LessonModels
            {
                StartTime = updatedLesson.StartTime,
                EndTime = updatedLesson.EndTime,
                Description = updatedLesson.Description,
                TeacherId = lesson.Teacher.UserName,
                StudentIds = lesson.Students.Select(s => s.Id).ToList()
            };

            await ValidateLessonDto(tempDto, lesson.Teacher, lesson.Students);

            lesson.StartTime = updatedLesson.StartTime;
            lesson.EndTime = updatedLesson.EndTime;
            lesson.Description = updatedLesson.Description;
            lesson.Status = LessonStatus.Scheduled;

            await _context.SaveChangesAsync();
            return lesson;
        }

        

        public async Task<bool> DeleteLessonAsync(int lessonId)
        {
            var lesson = await _context.Lessons.FindAsync(lessonId);
            if (lesson == null) return false;

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
                    if (student.PaidLessons >= 0)
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

        public async Task AutoDeleteCanceledLessonsAsync()
        {
            var thresholdDate = DateTime.UtcNow.AddDays(-14);

            var oldCanceledLessons = await _context.Lessons
                .Where(l => l.Status == LessonStatus.Canceled && l.UpdatedAt < thresholdDate)
                .ToListAsync();

            if (oldCanceledLessons.Any())
            {
                _context.Lessons.RemoveRange(oldCanceledLessons);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> CancelLessonAsync(int lessonId)
        {
            var lesson = await _context.Lessons.FindAsync(lessonId);
            if (lesson == null || lesson.Status == LessonStatus.Canceled)
                return false;

            lesson.Status = LessonStatus.Canceled;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<Lesson?> GetLessonByIdAsync(int lessonId)
        {
            return await _context.Lessons
                .Include(l => l.Teacher)
                .Include(l => l.Students)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId);
        }

        public async Task<IEnumerable<LessonDto>> GetScheduledLessonsForUserAsync(string userId)
        {
            var lessons = await _context.Lessons
                .Include(l => l.Students)
                .Include(l => l.Teacher)
                .Where(l => l.Status == LessonStatus.Scheduled &&
                            (l.Teacher.UserName == userId || l.Students.Any(s => s.UserName == userId)))
                .ToListAsync();

            return lessons.Select(l => new LessonDto
            {
                LessonId = l.LessonId,
                StartTime = l.StartTime,
                EndTime = l.EndTime,
                Description = l.Description
            }).ToList();
        }
        private async Task ValidateLessonDto(LessonModels dto, User teacher, ICollection<User> students)
        {
            if (dto.StartTime >= dto.EndTime)
                throw new ArgumentException("Start time must be earlier than end time.");

            if (dto.StartTime < DateTime.UtcNow)
                throw new ArgumentException("Cannot schedule a lesson in the past.");

            if (!string.IsNullOrWhiteSpace(dto.Description) && dto.Description.Length > 500)
                throw new ArgumentException("Description is too long (max 500 characters).");

            bool hasConflict = await _context.Lessons
                .Where(l =>
                    l.Status == LessonStatus.Scheduled &&
                    l.StartTime < dto.EndTime &&
                    l.EndTime > dto.StartTime &&
                    (l.Teacher.Id == teacher.Id || l.Students.Any(s => students.Select(st => st.Id).Contains(s.Id))))
                .AnyAsync();

            if (hasConflict)
                throw new InvalidOperationException("The teacher or one of the students already has a lesson at this time.");
        }
    }

}
