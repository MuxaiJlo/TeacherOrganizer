using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Interefaces
{
    public interface ILessonDetailsService
    {
        // Отримати всі деталі уроків доступні для конкретного користувача
        Task<IEnumerable<LessonDetail>> GetAllAccessibleForUserAsync(string userId);

        // Отримати конкретні деталі уроку за ідентифікатором
        Task<LessonDetail> GetByIdAsync(int id);

        // Перевірка чи має користувач доступ до даних деталей уроку
        Task<bool> HasUserAccessAsync(int lessonDetailsId, string userId);

        // Створення нових деталей уроку
        Task<LessonDetail> CreateAsync(LessonDetail lessonDetails, List<string> accessibleUserIds);

        // Оновлення деталей уроку
        Task<LessonDetail> UpdateAsync(LessonDetail lessonDetails);

        // Оновлення списку користувачів з доступом
        Task UpdateAccessibleUsersAsync(int lessonDetailsId, List<string> userIds);

        // Видалення деталей уроку
        Task<bool> DeleteAsync(int id);

        // Додавання користувача в список доступу
        Task AddUserAccessAsync(int lessonDetailsId, string userId);

        // Видалення користувача зі списку доступу
        Task RemoveUserAccessAsync(int lessonDetailsId, string userId);
    }
}
