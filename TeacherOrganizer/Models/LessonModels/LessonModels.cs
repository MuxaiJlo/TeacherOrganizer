using System.ComponentModel.DataAnnotations;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Models.LessonModels
{
    public class LessonModels
    {
        [Required]
        public string TeacherId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        public LessonStatus Status { get; set; } = LessonStatus.Scheduled;

        [Required]
        [MinLength(1)]
        public List<string> StudentIds { get; set; }
    }

}
