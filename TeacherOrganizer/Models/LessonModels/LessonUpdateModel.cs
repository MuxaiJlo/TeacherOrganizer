using System.ComponentModel.DataAnnotations;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Models.CalendarModels
{
    public class LessonUpdateModel
    {
        [Required]
        public DateTime StartTime { get; set; }
        [Required]
        public DateTime EndTime { get; set; }
        [MaxLength(500)]
        public string Description { get; set; }
        [Required]
        public LessonStatus Status { get; set; }
    }

}
