using System.Data;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Interefaces
{
    public interface ILessonService
    {
        Task<Lesson> AddLessonAsync(Lesson lesson);
        Task<Lesson> UpdateLessonAsync(int lessonId, Lesson updatedLesson);
        Task<bool> DeleteLessonAsync(int lessonId);
        Task<Lesson> ProposeRecheduleAsync(int lessonId, DateTime proposedStart, DateTime proposedEnd);
        Task<List<Lesson>> GetLessonsForUserAsync(string userId, DateTime start, DateTime end);
    }
}
