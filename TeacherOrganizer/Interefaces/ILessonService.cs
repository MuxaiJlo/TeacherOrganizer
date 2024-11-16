using TeacherOrganizer.Models.CalendarModels;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.Lessons;

namespace TeacherOrganizer.Interefaces
{
    public interface ILessonService
    {
        Task<Lesson> AddLessonAsync(LessonModels lessonDto);
        Task<Lesson?> GetLessonByIdAsync(int lessonId);
        Task<Lesson> UpdateLessonAsync(int lessonId, LessonUpdateModel updatedLesson);
        Task<bool> DeleteLessonAsync(int lessonId);
        Task<Lesson> ProposeRescheduleAsync(int lessonId, DateTime proposedStart, DateTime proposedEnd, string initiatorId);
        Task<List<Lesson>> GetLessonsForUserAsync(string userId, DateTime start, DateTime end);
    }
}
