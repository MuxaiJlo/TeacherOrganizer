using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.ViewModels;

namespace TeacherOrganizer.Controllers.Main
{
	[Route("api/[controller]")]
	[ApiController]
	public class MainController : ControllerBase
    {
        private readonly UserManager<User> _userManager;

        public MainController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }
		[HttpGet("index")]
		[Authorize(Roles = "Student")]
		public async Task<IActionResult> Index()
        {
			var user = await _userManager.GetUserAsync(User);
			if (user == null)
			{
				return Unauthorized("User not found or not authorized.");
			}

			var roles = await _userManager.GetRolesAsync(user);
			foreach (var role in roles)
			{
				Console.WriteLine($"User role: {role}");  // Логування ролі
			}

			var model = new MainViewModel
			{
				Username = user.UserName,
				LoginTime = DateTime.UtcNow
			};

			return Ok("You have passed the bearer authentication.");
		}
    }
}
