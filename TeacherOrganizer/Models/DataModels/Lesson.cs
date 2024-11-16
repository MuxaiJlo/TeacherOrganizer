using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace TeacherOrganizer.Models.DataModels
{
    public enum LessonStatus
    {
        Scheduled,
        Canceled,
        Completed,
        RescheduledRequest
    }

    public class Lesson
    {
        [Key]
        public int LessonId { get; set; }

        [Required]
        public string TeacherId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public string Description { get; set; }

        [Required]
        public LessonStatus Status { get; set; } = LessonStatus.Scheduled;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public User Teacher { get; set; }

        public ICollection<User> Students { get; set; }
    }
}