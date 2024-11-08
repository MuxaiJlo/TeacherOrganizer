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
		[Authorize]
		public async Task<IActionResult> Index()
		{
			// Отримуємо ім'я користувача
			var userName = User.Identity?.Name;

			// Спробуємо знайти користувача безпосередньо за ім’ям
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

			// Авторизація пройшла успішно
			var roles = await _userManager.GetRolesAsync(user);
			Console.WriteLine("User authorized successfully");
			Console.WriteLine($"Username: {user.UserName}, Email: {user.Email}, Roles: {string.Join(", ", roles)}");

			var model = new MainViewModel
			{
				Username = user.UserName,
				LoginTime = DateTime.UtcNow
			};

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
