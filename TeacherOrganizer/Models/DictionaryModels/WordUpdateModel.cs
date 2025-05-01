using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.DictionaryModels
{
    public class WordUpdateModel
    {
        [Required]
        public int DictionaryId { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "Text must be less than 100 characters.")]
        public string Text { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "Translation must be less than 100 characters.")]
        public string Translation { get; set; }

        [StringLength(250, ErrorMessage = "Example must be less than 250 characters.")]
        public string Example { get; set; }
    }

}
