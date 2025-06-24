using Microsoft.AspNetCore.Mvc;

namespace TeacherOrganizer.Controllers.Admin
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
