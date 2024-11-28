using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.DataModels
{
    public class Dictionary
    {
        [Key]
        public int DictionaryId { get; set; }
        public int UserId { get; set; }
        public int? OriginalDictionaryId { get; set; }
        [Required]
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }

        public User User { get; set; }
        public Dictionary OriginalDictionary { get; set; }
        public ICollection<Dictionary> CopiedDictionaries { get; set; }
        public ICollection<Word> Words { get; set; }
    }
}