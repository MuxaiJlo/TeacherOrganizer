using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Services
{
    public class WordService : IWordService
    {
        private readonly ApplicationDbContext _context;

        public WordService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Word> AddWordAsync(WordCreateModel model)
        {
            var dictionary = await _context.Dictionaries.FirstOrDefaultAsync(d => d.DictionaryId == model.DictionaryId);

            if (dictionary == null)
                throw new Exception("Dictionary not found.");

            var newWord = new Word
            {
                DictionaryId = model.DictionaryId,
                Text = model.Text,
                Translation = model.Translation,
                Example = model.Example
            };

            _context.Words.Add(newWord);
            await _context.SaveChangesAsync();

            return newWord;
        }

        public async Task<Word> GetWordByIdAsync(int wordId)
        {
            return await _context.Words.FirstOrDefaultAsync(w => w.WordId == wordId);
        }

        public async Task<bool> DeleteWordAsync(int wordId)
        {
            var word = await _context.Words.FirstOrDefaultAsync(w => w.WordId == wordId);

            if (word == null)
                return false;

            _context.Words.Remove(word);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
