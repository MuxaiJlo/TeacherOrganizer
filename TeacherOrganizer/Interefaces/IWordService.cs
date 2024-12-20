using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.DictionaryModels;

namespace TeacherOrganizer.Interefaces
{
    public interface IWordService
    {
        Task<Word> AddWordAsync(WordCreateModel model);
        Task<Word> GetWordByIdAsync(int wordId);
        Task<bool> DeleteWordAsync(int wordId);
    }
}
