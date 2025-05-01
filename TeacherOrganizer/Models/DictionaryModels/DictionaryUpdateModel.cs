using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.DictionaryModels
{
    public class DictionaryUpdateModel
    {
        [Required]
        [StringLength(100, ErrorMessage = "Name must be less than 100 characters.")]
        public string Name { get; set; }
    }
}
