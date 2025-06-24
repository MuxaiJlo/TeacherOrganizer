using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Controllers.Dictionary
{
    [Route("api/[controller]")]
    public class DictionaryController : ControllerBase
    {
        private readonly IDictionaryService _dictionaryService;
        private readonly ApplicationDbContext _context;
        public DictionaryController(IDictionaryService dictionaryService, ApplicationDbContext context)
        {
            _dictionaryService = dictionaryService;
            _context = context;
        }

        // POST: api/Dictionary
        [HttpPost]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> CreateDictionary([FromBody] DictionaryCreateModel dictionary)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User ID not found in token." });


            try
            {
                var newDictionary = await _dictionaryService.CreateDictionaryAsync(dictionary, userId);

                return CreatedAtAction(nameof(GetDictionaryById), new { id = newDictionary.DictionaryId }, new
                {
                    newDictionary.DictionaryId,
                    newDictionary.Name,
                    newDictionary.CreatedAt,
                    User = new { newDictionary.User.Id, newDictionary.User.UserName },
                    OriginalDictionaryId = newDictionary.OriginalDictionaryId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error creating dictionary", Details = ex.Message });
            }
        }


        // GET: api/Dictionary
        [HttpGet]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> GetDictionaries()
        {
            var userId = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(userId)) return Unauthorized(new { Message = "User ID not found in token." });

            try
            {
                var dictionary = await _dictionaryService.GetDictionariesByUserAsync(userId);
                if (dictionary == null) return NotFound();
                return Ok(dictionary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error retrieving dictijnaries", Details = ex.Message });
            }
        }

        // GET: api/Dictionary/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> GetDictionaryById(int id)
        {
            try
            {
                var dictionary = await _dictionaryService.GetDictionaryByIdAsync(id);
                if (dictionary == null)
                {
                    return NotFound(new { Message = "Dictionary not found" });
                }
                return Ok(dictionary);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { Message = "Error retrieving dictionary", Details = ex.Message });
            }
        }

        // POST: api/Dictionary/{id}/Copy
        [HttpPost("{id}/Copy")]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> CopyDictionary(int id)
        {
            var user = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;


            if (string.IsNullOrEmpty(user))
                return Unauthorized(new { Message = "User ID not found in token." });

            try
            {
                var copiedDictionary = await _dictionaryService.CopyDictionaryAsync(id, user);
                return CreatedAtAction(nameof(GetDictionaryById), new { id = copiedDictionary.DictionaryId }, copiedDictionary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error copying dictionary", Details = ex.Message });
            }
        }
        // GET: api/Dictionary/all
        [HttpGet("all")]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> GetAllDicitionary()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userId)) return Unauthorized(new { Message = "User ID not found in token." });
                var dictionary = await _dictionaryService.GetAllDictionaryAsync(userId);
                if (dictionary == null) return NotFound();
                return Ok(dictionary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error retrieving dictijnaries", Details = ex.Message });
            }
        }
        // DELETE: api/Dictionary/{dictionaryId}
        [HttpDelete("{dictionaryId}")]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> DeleteDictionary(int dictionaryId)
        {
            var currentUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserName == User.FindFirstValue(ClaimTypes.Name));

            if (currentUser == null)
                return Unauthorized("User not found.");

            // Якщо студент — перевіряємо, чи володіє словником
            if (User.IsInRole("Student"))
            {
                var isOwned = await IsDictionaryOwnedByUser(dictionaryId, currentUser.Id);
                if (!isOwned)
                    return Forbid("You do not own this dictionary.");
            }

            // Якщо вчитель — дозволяємо без перевірки власності
            await _dictionaryService.DeleteDictionaryAsync(dictionaryId);
            return Ok();
        }


        // PUT: api/Dictionary/{dictionaryId}
        [HttpPut("{dictionaryId}")]
        [Authorize(Roles = "Teacher, Student")]
        public async Task<IActionResult> UpdateDictionary(int dictionaryId, [FromBody] DictionaryUpdateModel model)
        {
            if (model == null)
            {
                return BadRequest("Model is null");
            }

            if (string.IsNullOrWhiteSpace(model.Name))
            {
                return BadRequest("Dictionary name is required.");
            }
            var currentUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserName == User.FindFirstValue(ClaimTypes.Name));

            if (currentUser == null)
                return Unauthorized("User not found.");
            // Добавляем проверку владения словарем
            if (!await IsDictionaryOwnedByUser(dictionaryId, currentUser.Id))
                return Forbid("You do not own this dictionary.");

            var dictionary = await _dictionaryService.UpdateDictionaryAsync(dictionaryId, model);
            if (dictionary != null)
            {
                return Ok(dictionary);
            }
            return NotFound();
        }
        private async Task<bool> IsDictionaryOwnedByUser(int dictionaryId, string userId)
        {
            var dictionary = await _context.Dictionaries
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DictionaryId == dictionaryId);
            return dictionary != null && dictionary.UserId == userId;
        }

    }
}
