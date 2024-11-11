using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.ViewModels;

namespace TeacherOrganizer.Controllers.Main
{
    [Route("Main")]
    public class MainViewController : Controller
	{
        private readonly UserManager<User> _userManager;

        public MainViewController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }
        [HttpGet("Index")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> Index(MainViewModel model)
        {
            var userName = User.Identity?.Name;

            // Перевіряємо, чи отримано userName
            if (string.IsNullOrEmpty(userName))
            {
                Console.WriteLine("User not found or unauthorized - userName is null");
                return Unauthorized(new { Message = "User not found or not authorized. Username is null." });
            }

            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
            {
                Console.WriteLine("User not found or unauthorized");
                Console.WriteLine($"Username: {userName}");
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}");
                }

                var errorDetails = new
                {
                    Message = "User not found or not authorized.",
                    Username = userName,
                    Claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
                };

                return Unauthorized(errorDetails);
            }

            var roles = await _userManager.GetRolesAsync(user);
            Console.WriteLine("User authorized successfully");
            Console.WriteLine($"Username: {user.UserName}, Email: {user.Email}, Roles: {string.Join(", ", roles)}");

            return Ok(new
            {
                Message = "You have passed the bearer authentication.",
                UserInfo = new
                {
                    Username = user.UserName,
                    Email = user.Email,
                    Roles = roles
                }
            });
        }

    }
}
