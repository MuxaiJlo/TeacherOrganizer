using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.UserModels;

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
                        user.FirstName,
                        user.LastName,
                        user.Email,
                        user.PaidLessons
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
                LastName = user.LastName,
                PaidLessons = user.PaidLessons,
                Email = user.Email
            };


            return Ok(userDto);
        }

        [HttpGet("{userId}/roles")]
        public async Task<IActionResult> GetUserRoles(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(roles);
        }

        [HttpPost("{userId}/add-paid-lessons")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> AddPaidLessons(string userId, [FromQuery] int count)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.PaidLessons += count;
            await _context.SaveChangesAsync();

            return Ok(new { user.Id, user.PaidLessons });
        }

    }
}
