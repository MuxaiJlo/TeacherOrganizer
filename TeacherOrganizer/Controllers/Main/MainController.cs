using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.ViewModels;

namespace TeacherOrganizer.Controllers.Main
{
    [Authorize(Roles = "Student")]
    public class MainController : Controller
    {
        private readonly UserManager<User> _userManager;

        public MainController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var model = new MainViewModel
            {
                Username = user.UserName,
                LoginTime = DateTime.UtcNow 
            };

            return View("MainView", model);
        }
    }
}
