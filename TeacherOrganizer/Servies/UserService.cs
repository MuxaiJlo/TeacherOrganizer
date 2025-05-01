using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.UserModels;

namespace TeacherOrganizer.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;

        public UserService(UserManager<User> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<List<UserDto>> GetStudentsAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var students = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                if (roles.Contains("Student"))
                {
                    students.Add(MapToUserDto(user));
                }
            }

            return students;
        }

        public async Task<UserDto> GetUserByIdAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return null;

            var user = await _context.Users.FindAsync(userId);
            return user == null ? null : MapToUserDto(user);
        }

        public async Task<UserDto> GetUserByUsernameAsync(string username)
        {
            if (string.IsNullOrWhiteSpace(username)) return null;

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.UserName == username);
            return user == null ? null : MapToUserDto(user);
        }

        public async Task<List<string>> GetUserRolesAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return null;

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);
            return roles.ToList();
        }

        public async Task<UserSettingsDto> GetUserSettingsAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return null;

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new UserSettingsDto
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PaidLessons = user.PaidLessons,
                CreatedAt = user.CreatedAt,
                Roles = roles.ToList()
            };
        }

        public async Task<UserSettingsDto> UpdateUserSettingsAsync(string userId, UserSettingsUpdateDto updateDto)
        {
            if (string.IsNullOrWhiteSpace(userId) || updateDto == null) return null;

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            // Оновлення даних користувача
            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.Email = updateDto.Email;

            if (!string.IsNullOrWhiteSpace(updateDto.UserName) && user.UserName != updateDto.UserName)
            {
                user.UserName = updateDto.UserName;
            }

            await _context.SaveChangesAsync();

            return await GetUserSettingsAsync(userId);
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            if (string.IsNullOrWhiteSpace(userId) || changePasswordDto == null) return false;

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            // Перевірка поточного паролю
            var checkPassword = await _userManager.CheckPasswordAsync(user, changePasswordDto.CurrentPassword);
            if (!checkPassword) return false;

            var result = await _userManager.ChangePasswordAsync(
                user,
                changePasswordDto.CurrentPassword,
                changePasswordDto.NewPassword
            );

            return result.Succeeded;
        }

        public async Task<UserDto> AddPaidLessonsAsync(string userId, int count)
        {
            if (string.IsNullOrWhiteSpace(userId) || count <= 0) return null;

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            user.PaidLessons += count;
            await _context.SaveChangesAsync();

            return MapToUserDto(user);
        }

        public async Task<List<UserWithRolesDto>> GetAllUsersAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<UserWithRolesDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new UserWithRolesDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    CreatedAt = user.CreatedAt,
                    Roles = roles.ToList()
                });
            }

            return result;
        }

        public async Task<bool> ChangeUserRoleAsync(string userId, string newRole)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(newRole)) return false;

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            var result = await _userManager.AddToRoleAsync(user, newRole);

            return result.Succeeded;
        }

        public async Task<bool> DeleteUserAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return false;

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PaidLessons = user.PaidLessons
            };
        }
    }
}