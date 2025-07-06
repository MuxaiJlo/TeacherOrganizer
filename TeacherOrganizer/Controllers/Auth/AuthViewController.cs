using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Models.AuthModels;

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

        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            return await _authController.Logout();
        }
        [HttpGet("ForgotPassword")]
        public IActionResult ForgotPassword()
        {
            return View("ForgotPasswordView");
        }

        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordModel model)
        {
            return await _authController.ForgotPassword(model);
        }

        [HttpGet("ResetPassword")]
        public IActionResult ResetPassword(string email, string token)
        {
            ViewBag.Email = email;
            ViewBag.Token = token;
            return View("ResetPasswordView");
        }

        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword(ResetPasswordModel model)
        {
            return await _authController.ResetPassword(model);
        }
    }
}
