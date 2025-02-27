using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Servies
{
    public class DictionaryService : IDictionaryService
    {
        private readonly ApplicationDbContext _context;
        public DictionaryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Dictionary> CreateDictionaryAsync(DictionaryCreateModel dictionary, string userId)
        {
            // Убедитесь, что userId соответствует типу первичного ключа в таблице Users
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == userId); 

            if (user == null)
                throw new Exception("User not found");

            var newDictionary = new Dictionary
            {
                Name = dictionary.Name,
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                OriginalDictionaryId = dictionary.OriginalDictionaryId
            };

            _context.Dictionaries.Add(newDictionary);
            await _context.SaveChangesAsync();

            await _context.Entry(newDictionary).Reference(d => d.User).LoadAsync();
            return newDictionary;
        }



        public async Task<IEnumerable<Dictionary>> GetDictionariesByUserAsync(string userId)
        {
            return await _context.Dictionaries
               .Where(d => d.User.UserName == userId)
               .Include(d => d.Words)
               .Include(d => d.OriginalDictionary)
               .ToListAsync();
        }

        public async Task<Dictionary> GetDictionaryByIdAsync(int dictionaryId)
        {
            return await _context.Dictionaries
                .Include(d => d.Words)
                .Include(d => d.OriginalDictionary)
                .FirstOrDefaultAsync(d => d.DictionaryId == dictionaryId);
        }
        public async Task<Dictionary> CopyDictionaryAsync(int dictionaryId, string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userId);
            if (user == null)
                throw new Exception("User not found.");

            var originalDictionary = await _context.Dictionaries
                .Include(d => d.Words)
                .FirstOrDefaultAsync(d => d.DictionaryId == dictionaryId);

            if (originalDictionary == null)
                throw new Exception("Original dictionary not found.");

            var newDictionary = new Dictionary
            {
                Name = $"{originalDictionary.Name} - Copy",
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                OriginalDictionaryId = originalDictionary.DictionaryId,
                Words = originalDictionary.Words.Select(w => new Word
                {
                    Text = w.Text,
                    Translation = w.Translation,
                    Example = w.Example
                }).ToList()
            };

            _context.Dictionaries.Add(newDictionary);
            await _context.SaveChangesAsync();

            return newDictionary;
        }

    }
}
