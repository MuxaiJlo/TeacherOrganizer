using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Models.RegLogModels;

namespace TeacherOrganizer.Controllers.Auth
{
    [Route("AuthView")]
    public class AuthViewController : Controller
    {
        private readonly AuthController _authController;

        public AuthViewController(AuthController authController)
        {
            _authController = authController;
        }
        [HttpGet("Register")]
        public IActionResult Register()
        {
            return View("RegisterView");
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterModel model)
        {
            return await _authController.Register(model);
        }
        [HttpGet("Login")]
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
