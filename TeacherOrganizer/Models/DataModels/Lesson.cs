using System.ComponentModel.DataAnnotations;

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
        public DateTime? ProposedStartTime { get; set; }
        public DateTime? ProposedEndTime { get; set; }
        public bool? IsRescheduleConfirmed { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdateAt { get; set; }
        public string RecheduleInitiator { get; set; }
        public User Teacher { get; set; }
        public ICollection<User> Students { get; set; }
    }
}