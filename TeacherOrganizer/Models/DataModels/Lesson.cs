using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeacherOrganizer.Models.DataModels
{
    public class Lesson
    {
        [Key]
        public int LessonId { get; set; }
        public string TeacherId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public User Teacher { get; set; }
        public ICollection<User> Students { get; set; }
    }
}