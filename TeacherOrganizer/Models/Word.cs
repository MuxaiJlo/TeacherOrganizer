using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeacherOrganizer.Models
{
    public class Word
    {
        [Key]
        public int WordId { get; set; }
        public int DictionaryId { get; set; }
        [Required]
        public string Text { get; set; }
        public string Translation { get; set; }
        public string Example { get; set; }
        public Dictionary Dictionary { get; set; }
    }
}