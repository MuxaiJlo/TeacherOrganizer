using System.ComponentModel.DataAnnotations;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Models.DictionaryModels
{
    public class WordCreateModel
    {
        [Required]
        public int DictionaryId { get; set; }
        [Required]
        public string Text { get; set; }
        public string Translation { get; set; }
        public string Example { get; set; }
    }
}
