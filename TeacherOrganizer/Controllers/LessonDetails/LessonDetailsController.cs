using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.LessonDetailsModels;

namespace TeacherOrganizer.Controllers.LessonDetails
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LessonDetailsController : ControllerBase
    {
        private readonly ILessonDetailsService _lessonDetailsService;

        public LessonDetailsController(ILessonDetailsService lessonDetailsService)
        {
            _lessonDetailsService = lessonDetailsService;
        }

        // GET: api/LessonDetails/accessible
        [HttpGet("accessible")]
        public async Task<ActionResult<IEnumerable<LessonDetailsDTO>>> GetAccessibleLessonDetails()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var lessonDetails = await _lessonDetailsService.GetAllAccessibleForUserAsync(userId);

            var lessonDetailsDto = lessonDetails.Select(ld => new LessonDetailsDTO
            {
                LessonDetailsId = ld.LessonDetailsId,
                LessonId = ld.LessonId,
                Content = ld.Content,
                CreatedAt = ld.CreatedAt,
                UpdatedAt = ld.UpdatedAt,
                AccessibleUserIds = ld.AccessibleUsers.Select(u => u.UserName).ToList()
            });

            return Ok(lessonDetailsDto);
        }

        // GET: api/LessonDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LessonDetailsDTO>> GetLessonDetails(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var hasAccess = await _lessonDetailsService.HasUserAccessAsync(id, userId);

            if (!hasAccess)
                return Forbid();

            var lessonDetails = await _lessonDetailsService.GetByIdAsync(id);

            if (lessonDetails == null)
                return NotFound();

            var lessonDetailsDto = new LessonDetailsDTO
            {
                LessonDetailsId = lessonDetails.LessonDetailsId,
                LessonId = lessonDetails.LessonId,
                Content = lessonDetails.Content,
                CreatedAt = lessonDetails.CreatedAt,
                UpdatedAt = lessonDetails.UpdatedAt,
                AccessibleUserIds = lessonDetails.AccessibleUsers.Select(u => u.UserName).ToList()
            };

            return Ok(lessonDetailsDto);
        }

        // POST: api/LessonDetails
        [HttpPost]
        public async Task<ActionResult<LessonDetailsDTO>> CreateLessonDetails(CreateLessonDetailsDTO createDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Додаємо поточного користувача до списку з доступом
            if (!createDto.AccessibleUserIds.Contains(userId))
            {
                createDto.AccessibleUserIds.Add(userId);
            }

            var lessonDetails = new LessonDetail
            {
                LessonId = createDto.LessonId,
                Content = createDto.Content
            };

            var createdDetails = await _lessonDetailsService.CreateAsync(lessonDetails, createDto.AccessibleUserIds);

            var detailsDto = new LessonDetailsDTO
            {
                LessonDetailsId = createdDetails.LessonDetailsId,
                LessonId = createdDetails.LessonId,
                Content = createdDetails.Content,
                CreatedAt = createdDetails.CreatedAt,
                UpdatedAt = createdDetails.UpdatedAt,
                AccessibleUserIds = createDto.AccessibleUserIds
            };

            return CreatedAtAction(nameof(GetLessonDetails), new { id = detailsDto.LessonDetailsId }, detailsDto);
        }

        // PUT: api/LessonDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLessonDetails(int id, UpdateLessonDetailsDTO updateDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var hasAccess = await _lessonDetailsService.HasUserAccessAsync(id, userId);

            if (!hasAccess)
                return Forbid();

            var existingDetails = await _lessonDetailsService.GetByIdAsync(id);

            if (existingDetails == null)
                return NotFound();

            existingDetails.Content = updateDto.Content;

            await _lessonDetailsService.UpdateAsync(existingDetails);

            return NoContent();
        }

        // PUT: api/LessonDetails/5/access
        [HttpPut("{id}/access")]
        public async Task<IActionResult> UpdateAccess(int id, UpdateAccessDTO updateAccessDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var hasAccess = await _lessonDetailsService.HasUserAccessAsync(id, userId);

            if (!hasAccess)
                return Forbid();

            // Додаємо поточного користувача до списку, щоб він не втратив доступ
            if (!updateAccessDto.UserIds.Contains(userId))
            {
                updateAccessDto.UserIds.Add(userId);
            }

            await _lessonDetailsService.UpdateAccessibleUsersAsync(id, updateAccessDto.UserIds);

            return NoContent();
        }

        // DELETE: api/LessonDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLessonDetails(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var hasAccess = await _lessonDetailsService.HasUserAccessAsync(id, userId);

            if (!hasAccess)
                return Forbid();

            var result = await _lessonDetailsService.DeleteAsync(id);

            if (!result)
                return NotFound();

            return NoContent();
        }

        // POST: api/LessonDetails/5/users/{userId}
        [HttpPost("{id}/users/{userId}")]
        public async Task<IActionResult> AddUserAccess(int id, string userId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var hasAccess = await _lessonDetailsService.HasUserAccessAsync(id, currentUserId);

            if (!hasAccess)
                return Forbid();

            await _lessonDetailsService.AddUserAccessAsync(id, userId);

            return NoContent();
        }

        // DELETE: api/LessonDetails/5/users/{userId}
        [HttpDelete("{id}/users/{userId}")]
        public async Task<IActionResult> RemoveUserAccess(int id, string userId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Перевіряємо, що користувач не намагається видалити сам себе
            if (userId == currentUserId)
                return BadRequest("Не можна видалити доступ для самого себе");

            var hasAccess = await _lessonDetailsService.HasUserAccessAsync(id, currentUserId);

            if (!hasAccess)
                return Forbid();

            await _lessonDetailsService.RemoveUserAccessAsync(id, userId);

            return NoContent();
        }
    }
}

