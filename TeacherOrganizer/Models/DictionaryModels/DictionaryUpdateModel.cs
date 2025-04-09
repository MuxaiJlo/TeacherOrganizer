using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.DictionaryModels
{
    public class DictionaryUpdateModel
    {
        [Required]
        public string Name { get; set; }
    }
}
