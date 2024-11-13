using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Servies
{
    public class LessonService : ILessonService
    {
        private readonly ApplicationDbContext _context;

        public LessonService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Lesson> AddLessonAsync(Lesson lesson)
        {
            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();
            return lesson;
        }

        public async Task<bool> DeleteLessonAsync(int lessonId)
        {
            var lesson = _context.Lessons.FindAsync(lessonId);
            if (lesson != null) return false;

            _context.Lessons.Remove(await lesson);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Lesson>> GetLessonsForUserAsync(string userId, DateTime start, DateTime end)
        {
            return await _context.Lessons
                .Where(l => l.Students.Any(s => s.Id == userId) || l.TeacherId == userId)
                .Where(l => l.StartTime >= start && l.EndTime <= end)
                .ToListAsync();
        }

        public async Task<Lesson> ProposeRecheduleAsync(int lessonId, DateTime proposedStart, DateTime proposedEnd)
        {
            var lesson = await _context.Lessons.FindAsync(lessonId);
            if (lesson == null) return null;

            //TODO: Functionality to add notification and request to accept it.
            lesson.Status = LessonStatus.RescheduledRequest;
            lesson.StartTime = proposedStart;
            lesson.EndTime = proposedEnd;

            _context.Lessons.Update(lesson);
            await _context.SaveChangesAsync();
            return lesson;
        }

        public async Task<Lesson> UpdateLessonAsync(int lessonId, Lesson updatedLesson)
        {
            var existingLesson = await _context.Lessons.FindAsync(lessonId);
            if (existingLesson == null) return null;

            existingLesson.StartTime = updatedLesson.StartTime;
            existingLesson.EndTime = updatedLesson.EndTime;
            existingLesson.Description = updatedLesson.Description;
            existingLesson.Status = updatedLesson.Status;

            _context.Lessons.Update(existingLesson);
            await _context.SaveChangesAsync();
            return existingLesson;
        }
    }
}
