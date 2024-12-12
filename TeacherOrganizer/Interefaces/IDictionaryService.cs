using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Interefaces
{
    public interface IDictionaryService
    {
        Task<Dictionary> CreateDictionaryAsync(DictionaryCreateModel dictionary, string userId);
        Task<IEnumerable<Dictionary>> GetDictionariesByUserAsync(string userId);
        Task<Dictionary> GetDictionaryByIdAsync(int dictionaryId);
    }
}
