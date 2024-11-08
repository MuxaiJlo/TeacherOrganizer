using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Models.RegLogModels;

namespace TeacherOrganizer.Controllers.Auth
{
    public class AccountController : Controller
    {
        private readonly AuthController _authController;

        public AccountController(AuthController authController)
        {
            _authController = authController;
        }

        public IActionResult Register()
        {
            return View("RegisterView");
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterModel model)
        {
            return await _authController.Register(model);
        }

        public IActionResult Login()
        {
            return View("LoginView");
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginModel model)
        {
            return await _authController.Login(model);
        }

        public async Task<IActionResult> Logout()
        {
            return await _authController.Logout();
        }
    }
}
