using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.DictionaryModels
{
    public class DictionaryCreateModel
    {
        [Required]
        public string Name { get; set; }
        public int? OriginalDictionaryId { get; set; }
    }
}
