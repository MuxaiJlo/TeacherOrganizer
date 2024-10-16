using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeacherOrganizer.Models
{
    public class Lesson
    {
        [Key]
        public int LessonId { get; set; }
        public int TeacherId { get; set; }
        public int StudentId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Description { get; set; }
        public User Teacher { get; set; }
        public User Student { get; set; }
    }
}