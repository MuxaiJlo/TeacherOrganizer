using Microsoft.AspNetCore.Mvc;

namespace TeacherOrganizer.Controllers.Main
{
	public class MainViewController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
