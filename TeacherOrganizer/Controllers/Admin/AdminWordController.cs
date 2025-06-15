using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    public class AdminWordController : Controller
    {
        private readonly IWordService _wordService;
        private readonly IDictionaryService _dictionaryService;

        public AdminWordController(IWordService wordService, IDictionaryService dictionaryService)
        {
            _wordService = wordService;
            _dictionaryService = dictionaryService;
        }

        // GET: /AdminWord
        public async Task<IActionResult> Index(string id, string text, string translation, string example, string dictionaryId)
        {
            var dictionaries = await _dictionaryService.GetAllDictionaryAsync("");
            var allWords = dictionaries.SelectMany(d => d.Words ?? new List<Word>()).ToList();

            if (!string.IsNullOrWhiteSpace(id))
                allWords = allWords.Where(w => w.WordId.ToString().Contains(id.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
            if (!string.IsNullOrWhiteSpace(text))
                allWords = allWords.Where(w => w.Text != null && w.Text.Contains(text.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
            if (!string.IsNullOrWhiteSpace(translation))
                allWords = allWords.Where(w => w.Translation != null && w.Translation.Contains(translation.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
            if (!string.IsNullOrWhiteSpace(example))
                allWords = allWords.Where(w => w.Example != null && w.Example.Contains(example.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
            if (!string.IsNullOrWhiteSpace(dictionaryId) && int.TryParse(dictionaryId, out int dictId))
                allWords = allWords.Where(w => w.DictionaryId == dictId).ToList();

            // Pass dictionary list (id and name) to the view
            var dictionaryList = dictionaries
                .Select(d => new { d.DictionaryId, d.Name })
                .ToList();
            ViewBag.DictionaryList = dictionaryList;

            return View(allWords);
        }

        // GET: /AdminWord/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var word = await _wordService.GetWordByIdAsync(id);
            if (word == null)
                return NotFound();

            // Find all dictionaries containing this word
            var dictionaries = await _dictionaryService.GetAllDictionaryAsync("");
            var usedDictionaries = dictionaries
                .Where(d => d.Words != null && d.Words.Any(w => w.WordId == id))
                .Select(d => new { d.DictionaryId, d.Name })
                .ToList();

            ViewBag.UsedDictionaries = usedDictionaries;

            return View(word);
        }

        // GET: /AdminWord/Create
        public async Task<IActionResult> Create()
        {
            var dictionaries = await _dictionaryService.GetAllDictionaryAsync("");
            ViewBag.Dictionaries = dictionaries;
            return View();
        }

        // POST: /AdminWord/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(WordCreateModel model)
        {
            if (ModelState.IsValid)
            {
                await _wordService.AddWordAsync(model);
                return RedirectToAction(nameof(Index));
            }
            var dictionaries = await _dictionaryService.GetAllDictionaryAsync("");
            ViewBag.Dictionaries = dictionaries;
            return View(model);
        }

        // GET: /AdminWord/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            var word = await _wordService.GetWordByIdAsync(id);
            if (word == null)
                return NotFound();

            var model = new WordUpdateModel
            {
                DictionaryId = word.DictionaryId,
                Text = word.Text,
                Translation = word.Translation,
                Example = word.Example
            };
            var dictionaries = await _dictionaryService.GetAllDictionaryAsync("");
            ViewBag.Dictionaries = dictionaries;
            return View(model);
        }

        // POST: /AdminWord/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, WordUpdateModel model)
        {
            if (ModelState.IsValid)
            {
                await _wordService.UpdateWordAsync(id, model);
                return RedirectToAction(nameof(Index));
            }
            var dictionaries = await _dictionaryService.GetAllDictionaryAsync("");
            ViewBag.Dictionaries = dictionaries;
            return View(model);
        }

        // GET: /AdminWord/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            var word = await _wordService.GetWordByIdAsync(id);
            if (word == null)
                return NotFound();
            return View(word);
        }

        // POST: /AdminWord/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var word = await _wordService.GetWordByIdAsync(id);
            if (word != null)
                await _wordService.DeleteWordFromDictionaryAsync(id, word.DictionaryId);
            return RedirectToAction(nameof(Index));
        }
    }
}