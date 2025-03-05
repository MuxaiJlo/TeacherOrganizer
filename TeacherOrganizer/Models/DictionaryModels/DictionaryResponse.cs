using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Models.DictionaryModels
{
    public class DictionaryResponse
    {
        public int DictionaryId { get; set; }
        public string UserId { get; set; }
        public int? OriginalDictionaryId { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public Dictionary OriginalDictionary { get; set; }
        public ICollection<Dictionary> CopiedDictionaries { get; set; }
        public ICollection<Word> Words { get; set; }
        public UserDto UserDto { get; set; }
    }
}
