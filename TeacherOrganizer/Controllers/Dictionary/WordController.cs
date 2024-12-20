using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Controllers.Dictionary
{
    [Route("api/[controller]")]
    [ApiController]
    public class WordController : ControllerBase
    {
        private readonly IWordService _wordService;

        public WordController(IWordService wordService)
        {
            _wordService = wordService;
        }

        // POST: api/Word
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddWord([FromBody] WordCreateModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

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

        // GET: api/Word/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetWordById(int id)
        {
            try
            {
                var word = await _wordService.GetWordByIdAsync(id);

                if (word == null)
                    return NotFound(new { Message = "Word not found." });

                return Ok(word);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error retrieving word", Details = ex.Message });
            }
        }

        // DELETE: api/Word/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteWord(int id)
        {
            try
            {
                var success = await _wordService.DeleteWordAsync(id);

                if (!success)
                    return NotFound(new { Message = "Word not found." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error deleting word", Details = ex.Message });
            }
        }
    }
}