using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TeacherOrganizer.Controllers
{
	[ApiController]
	public class TestController : ControllerBase
	{

		[HttpGet("api/SomeProtectedRoute")]
		[Authorize]
		public IActionResult Test()
		{
			return Ok("You have passed the bearer authentication.");
		}
	}
}
