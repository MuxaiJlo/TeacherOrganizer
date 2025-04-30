using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.UserModels;

namespace TeacherOrganizer.Controllers.Users
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("Students")]
        public async Task<IActionResult> GetStudents()
        {
            var students = await _userService.GetStudentsAsync();
            return Ok(students);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(string userId)
        {
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        [HttpGet("by-username/{username}")]
        [Authorize]
        public async Task<IActionResult> GetUserByUsername(string username)
        {
            var user = await _userService.GetUserByUsernameAsync(username);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }


        [HttpGet("{userId}/roles")]
        public async Task<IActionResult> GetUserRoles(string userId)
        {
            var roles = await _userService.GetUserRolesAsync(userId);
            if (roles == null)
            {
                return NotFound();
            }

            return Ok(roles);
        }

        [HttpPost("{userId}/add-paid-lessons")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> AddPaidLessons(string userId, [FromQuery] int count)
        {
            var result = await _userService.AddPaidLessonsAsync(userId, count);
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        // Нові методи для роботи зі сторінкою налаштувань

        [HttpGet("{userId}/settings")]
        [Authorize]
        public async Task<IActionResult> GetUserSettings(string userId)
        {
            // Перевірка, щоб користувач міг отримати тільки свої налаштування або адміністратор/вчитель
            if (userId != User.FindFirst("sub")?.Value && !User.IsInRole("Admin") && !User.IsInRole("Teacher"))
            {
                return Forbid();
            }

            var settings = await _userService.GetUserSettingsAsync(userId);
            if (settings == null)
            {
                return NotFound();
            }

            return Ok(settings);
        }

        [HttpPut("{userId}/settings")]
        [Authorize]
        public async Task<IActionResult> UpdateUserSettings(string userId, [FromBody] UserSettingsUpdateDto updateDto)
        {
            // Перевірка, щоб користувач міг змінювати тільки свої налаштування або адміністратор/вчитель
            if (userId != User.FindFirst("sub")?.Value && !User.IsInRole("Admin") && !User.IsInRole("Teacher"))
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedSettings = await _userService.UpdateUserSettingsAsync(userId, updateDto);
            if (updatedSettings == null)
            {
                return NotFound();
            }

            return Ok(updatedSettings);
        }

        [HttpPost("{userId}/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(string userId, [FromBody] ChangePasswordDto changePasswordDto)
        {
            // Користувач може змінювати тільки свій пароль
            if (userId != User.FindFirst("sub")?.Value)
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userService.ChangePasswordAsync(userId, changePasswordDto);
            if (!result)
            {
                return BadRequest(new { Message = "Failed to change password. Please check your current password." });
            }

            return Ok(new { Message = "Password changed successfully" });
        }
    }
}