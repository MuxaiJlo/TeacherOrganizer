using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Controllers.Dictionary
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Teacher, Student")] // Ensure all actions require authorization
    public class WordController : ControllerBase
    {
        private readonly IWordService _wordService;
        private readonly IDictionaryService _dictionaryService;
        private readonly ApplicationDbContext _context;

        public WordController(IWordService wordService, IDictionaryService dictionaryService, ApplicationDbContext context)
        {
            _wordService = wordService;
            _dictionaryService = dictionaryService;
            _context = context;
        }


        private async Task<bool> IsDictionaryOwnedByUser(int dictionaryId)
        {
            var currentUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserName == User.FindFirstValue(ClaimTypes.Name));

            Console.WriteLine($"=======USER : {currentUser.Id}");

            // Убедитесь, что в реализации GetDictionaryByIdAsync тоже используется AsNoTracking
            var dictionary = await _context.Dictionaries
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DictionaryId == dictionaryId);

            Console.WriteLine($"=======USER : {currentUser.Id} ========= DICTIOANRY {dictionary.UserId}");

            return dictionary != null && dictionary.UserId == currentUser.Id;
        }

        [HttpPost]
        public async Task<IActionResult> AddWord([FromBody] WordCreateModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!await IsDictionaryOwnedByUser(model.DictionaryId))
                return StatusCode(403, new { Message = "You do not own this dictionary."});

            try
            {
                var newWord = await _wordService.AddWordAsync(model);
                return CreatedAtAction(nameof(GetWordById), new { id = newWord.WordId }, newWord);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error adding word", Details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetWordById(int id)
        {  
            try
            {
                var word = await _wordService.GetWordByIdAsync(id);

                if (word == null)
                    return NotFound(new { Message = "Word not found." });

                if (!await IsDictionaryOwnedByUser(word.DictionaryId))
                    return Forbid("You do not own the dictionary containing this word.");

                return Ok(word);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error retrieving word", Details = ex.Message });
            }
        }

        [HttpDelete("{id}/Dictionary/{dictionaryId}")]
        public async Task<IActionResult> DeleteWordFromDictionary(int id, int dictionaryId)
        {
            if (!await IsDictionaryOwnedByUser(dictionaryId))
                return Forbid("You do not own the dictionary.");

            try
            {
                var success = await _wordService.DeleteWordFromDictionaryAsync(id, dictionaryId);

                if (!success)
                    return NotFound(new { Message = "Word not found in the specified dictionary." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error deleting word", Details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWord(int id, [FromBody] WordUpdateModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!await IsDictionaryOwnedByUser(model.DictionaryId))
                return Forbid("You do not own this dictionary.");

            try
            {
                var updatedWord = await _wordService.UpdateWordAsync(id, model);
                return Ok(updatedWord);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error updating word", Details = ex.Message });
            }
        }
    }
}