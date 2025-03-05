using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Controllers.Users
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;

        public UsersController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("Students")]
        public async Task<IActionResult> GetStudents()
        {
            var users = await _userManager.Users.ToListAsync();

            var students = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                if (roles.Contains("Student"))  
                {
                    students.Add(new
                    {
                        user.Id,
                        user.UserName,
                        user.Email
                    });
                }
            }

            return Ok(students);
        }
    }
}
