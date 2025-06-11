using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    public class AdminDictionaryController : Controller
    {
        private readonly IDictionaryService _dictionaryService;

        public AdminDictionaryController(IDictionaryService dictionaryService)
        {
            _dictionaryService = dictionaryService;
        }

        public async Task<IActionResult> Index(string id, string name, string owner, string createdAt, string wordsCount)
        {
            var dictionaries = await _dictionaryService.GetAllDictionaryAsync("");

            if (!string.IsNullOrWhiteSpace(id))
                dictionaries = dictionaries.Where(d => d.DictionaryId.ToString().Contains(id.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(name))
                dictionaries = dictionaries.Where(d => d.Name != null && d.Name.Contains(name.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();

            if (!string.IsNullOrWhiteSpace(owner))
                dictionaries = dictionaries.Where(d =>
                    (d.User?.UserName ?? d.UserId ?? "Unknown").Contains(owner.Trim(), StringComparison.OrdinalIgnoreCase)
                ).ToList();

            if (!string.IsNullOrWhiteSpace(createdAt) && DateTime.TryParse(createdAt, out var createdDate))
                dictionaries = dictionaries.Where(d => d.CreatedAt.Date == createdDate.Date).ToList();

            if (!string.IsNullOrWhiteSpace(wordsCount) && int.TryParse(wordsCount, out var wc))
                dictionaries = dictionaries.Where(d => (d.Words?.Count ?? 0) == wc).ToList();

            return View(dictionaries);
        }

        // GET: /AdminDictionaries/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var dictionary = await _dictionaryService.GetDictionaryByIdAsync(id);
            if (dictionary == null)
                return NotFound();
            return View(dictionary);
        }

        // GET: /AdminDictionaries/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            var dictionary = await _dictionaryService.GetDictionaryByIdAsync(id);
            if (dictionary == null)
                return NotFound();

            // Map to update model
            var model = new DictionaryUpdateModel
            {
                Name = dictionary.Name
            };
            ViewBag.DictionaryId = id;
            return View(model);
        }

        // POST: /AdminDictionaries/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, DictionaryUpdateModel model)
        {
            if (ModelState.IsValid)
            {
                var updated = await _dictionaryService.UpdateDictionaryAsync(id, model);
                if (updated == null)
                    return NotFound();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.DictionaryId = id;
            return View(model);
        }

        // GET: /AdminDictionaries/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            var dictionary = await _dictionaryService.GetDictionaryByIdAsync(id);
            if (dictionary == null)
                return NotFound();
            return View(dictionary);
        }

        // POST: /AdminDictionaries/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _dictionaryService.DeleteDictionaryAsync(id);
            return RedirectToAction(nameof(Index));
        }
    }
}