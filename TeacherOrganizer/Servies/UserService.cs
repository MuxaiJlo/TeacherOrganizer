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
                    students.Add(new UserDto
                    {
                        Id = user.Id,
                        UserName = user.UserName,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email,
                        PaidLessons = user.PaidLessons
                    });
                }
            }

            return students;
        }

        public async Task<UserDto> GetUserByIdAsync(string userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return null;
            }

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
        public async Task<UserDto> GetUserByUsernameAsync(string username)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user == null) return null;

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


        public async Task<List<string>> GetUserRolesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            var roles = await _userManager.GetRolesAsync(user);
            return roles.ToList();
        }

        public async Task<UserSettingsDto> GetUserSettingsAsync(string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return null;
            }

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
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return null;
            }

            // Оновлення даних користувача
            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.Email = updateDto.Email;

            if (!string.IsNullOrEmpty(updateDto.UserName) && user.UserName != updateDto.UserName)
            {
                user.UserName = updateDto.UserName;
            }

            await _context.SaveChangesAsync();

            // Отримання оновлених даних
            return await GetUserSettingsAsync(userId);
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            // Перевірка поточного паролю
            var checkPassword = await _userManager.CheckPasswordAsync(user, changePasswordDto.CurrentPassword);
            if (!checkPassword)
            {
                return false;
            }

            // Зміна паролю
            var result = await _userManager.ChangePasswordAsync(
                user,
                changePasswordDto.CurrentPassword,
                changePasswordDto.NewPassword
            );

            return result.Succeeded;
        }

        public async Task<UserDto> AddPaidLessonsAsync(string userId, int count)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return null;
            }

            user.PaidLessons += count;
            await _context.SaveChangesAsync();

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