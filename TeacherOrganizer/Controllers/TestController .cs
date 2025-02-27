using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace TeacherOrganizer.Controllers
{
	[ApiController]
	public class TestController : ControllerBase
	{

		[HttpGet("api/SomeProtectedRoute")]
		[Authorize]
		public IActionResult Test()
		{
            var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
			var userNameByIdentity = User.Identity?.Name;
			var userClaimNameIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userClaimName = User.FindFirstValue(ClaimTypes.Name);
            Console.WriteLine($"========================{userId}==================================");
            Console.WriteLine($"========================{userNameByIdentity}==================================");
            Console.WriteLine($"========================{userClaimNameIdentifier}==================================");
            Console.WriteLine($"========================{userClaimName}==================================");
            return Ok("You have passed the bearer authentication.");
		}
	}
}
