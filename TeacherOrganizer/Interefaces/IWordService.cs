using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Interefaces
{
    public interface IWordService
    {
        Task<Word> AddWordAsync(WordCreateModel model);
        Task<Word> GetWordByIdAsync(int wordId);
        Task<bool> DeleteWordFromDictionaryAsync(int wordId, int dictionaryId);
        Task<Word> UpdateWordAsync(int wordId, WordUpdateModel model);
    }
}
