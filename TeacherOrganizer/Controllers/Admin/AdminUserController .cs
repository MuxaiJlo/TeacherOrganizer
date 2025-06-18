using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Interefaces;

namespace TeacherOrganizer.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    public class AdminUserController : Controller
    {
        private readonly IUserService _userService;

        public AdminUserController(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<IActionResult> Index(string id, string username, string email, string fullName, string role, string createdAt)
        {
            var users = await _userService.GetAllUsersAsync();

            if (!string.IsNullOrWhiteSpace(id))
                users = users.Where(u => u.Id.Contains(id.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(username))
                users = users.Where(u => u.UserName != null && u.UserName.Contains(username.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(email))
                users = users.Where(u => u.Email != null && u.Email.Contains(email.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(fullName))
                users = users.Where(u =>
                    ($"{u.FirstName} {u.LastName}").Contains(fullName.Trim(), StringComparison.OrdinalIgnoreCase)
                ).ToList();

            if (!string.IsNullOrWhiteSpace(role))
                users = users.Where(u => u.Roles != null && u.Roles.Any(r => r.Contains(role.Trim(), StringComparison.OrdinalIgnoreCase))).ToList();

            if (!string.IsNullOrWhiteSpace(createdAt) && DateTime.TryParse(createdAt, out var createdDate))
                users = users.Where(u => u.CreatedAt.Date == createdDate.Date).ToList();

            return View(users);
        }

        public async Task<IActionResult> Details(string id)
        {
            if (string.IsNullOrEmpty(id))
                return NotFound();

            var user = await _userService.GetUserWithLessonCountsAsync(id);
            if (user == null)
                return NotFound();

            var roles = await _userService.GetUserRolesAsync(id);

            ViewBag.Roles = roles;
            return View(user);
        }

        [HttpPost]
        public async Task<IActionResult> ChangeRole(string userId, string newRole)
        {
            await _userService.ChangeUserRoleAsync(userId, newRole);
            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            await _userService.DeleteUserAsync(userId);
            return RedirectToAction("Index");
        }
    }
}