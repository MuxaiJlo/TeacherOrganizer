using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Controllers.Users
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;

        public UsersController(UserManager<User> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context; 
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

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(string userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                UserName = user.UserName,
                FirstName = user.FirstName, 
                LastName = user.LastName 
            };

            return Ok(userDto);
        }

    }
}
