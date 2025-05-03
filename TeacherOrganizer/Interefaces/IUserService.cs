using TeacherOrganizer.Models.UserModels;

namespace TeacherOrganizer.Interefaces
{
    public interface IUserService
    {
        // Отримання користувачів
        Task<List<UserDto>> GetStudentsAsync();
        Task<UserDto> GetUserByIdAsync(string userId);
        Task<UserDto> GetUserWithLessonCountsAsync(string userId);
        Task<List<string>> GetUserRolesAsync(string userId);
        Task<UserDto> GetUserByUsernameAsync(string username);
        Task<UserSettingsDto> GetUserSettingsAsync(string userId);
        Task<UserSettingsDto> UpdateUserSettingsAsync(string userId, UserSettingsUpdateDto updateDto);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);

        Task<UserDto> AddPaidLessonsAsync(string userId, int count);
        Task<List<UserWithRolesDto>> GetAllUsersAsync();
        Task<bool> ChangeUserRoleAsync(string userId, string newRole);
        Task<bool> DeleteUserAsync(string userId);
    }
}
