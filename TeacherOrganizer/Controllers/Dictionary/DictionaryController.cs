using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Controllers.Dictionary
{
    [Route("api/[controller]")]
    public class DictionaryController : ControllerBase
    {
        private readonly IDictionaryService _dictionaryService;
        public DictionaryController(IDictionaryService dictionaryService)
        {
            _dictionaryService = dictionaryService;
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
                    return NotFound(new {Message = "Dictionary not found"});
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
            var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User ID not found in token." });

            try
            {
                var copiedDictionary = await _dictionaryService.CopyDictionaryAsync(id, userId);
                return CreatedAtAction(nameof(GetDictionaryById), new { id = copiedDictionary.DictionaryId }, copiedDictionary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error copying dictionary", Details = ex.Message });
            }
        }

    }
}
