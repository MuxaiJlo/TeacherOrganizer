using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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

        public string TeacherId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public string Description { get; set; }

        public LessonStatus Status { get; set; } = LessonStatus.Scheduled;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public User Teacher { get; set; }

        [JsonIgnore]
        public ICollection<User> Students { get; set; }
    }
}