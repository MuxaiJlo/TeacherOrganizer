using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.LessonDetailsModels
{
    public class CreateLessonDetailsDTO
    {
        [Required]
        public int LessonId { get; set; }
        [Required]
        public string Content { get; set; }
        public List<string> AccessibleUserIds { get; set; } = new List<string>();
    }
}
