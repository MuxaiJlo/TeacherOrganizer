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
        [Authorize(Roles = "Student, Teacher")]
        public async Task<IActionResult> Index()
        {
            var userName = User.Identity?.Name;

            if (string.IsNullOrEmpty(userName))
            {
                Console.WriteLine("User not found or unauthorized - userName is null");
                return Unauthorized(new { Message = "User not found or not authorized. Username is null." });
            }

            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
            {
                Console.WriteLine("User not found or unauthorized");
                return Unauthorized(new { Message = "User not found or not authorized." });
            }

            var model = new MainViewModel
            {
                Username = user.UserName,
                LoginTime = DateTime.UtcNow,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = (await _userManager.GetRolesAsync(user)).FirstOrDefault()
            };

            return View("Index", model);

        }
    }
}
