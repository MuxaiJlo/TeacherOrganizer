
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.LessonModels;

namespace TeacherOrganizer.Interefaces
{
    public interface ILessonService
    {
        Task<Lesson> AddLessonAsync(LessonModels lessonDto);
        Task<Lesson?> GetLessonByIdAsync(int lessonId);
        Task<Lesson> UpdateLessonAsync(int lessonId, LessonUpdateModel updatedLesson);
        Task<bool> DeleteLessonAsync(int lessonId);
        Task<List<Lesson>> GetLessonsForUserAsync(string userId, DateTime start, DateTime end);
        Task AutoCompleteLessons();
        Task<bool> CancelLessonAsync(int lessonId);
        Task AutoDeleteCanceledLessonsAsync();
        Task<List<Lesson>> GetAllLessonsAsync();
        Task<IEnumerable<LessonDto>> GetScheduledLessonsForUserAsync(string userId);
    }
}
