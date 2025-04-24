using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TeacherOrganizer.Models.DataModels
{
    public class LessonDetails
    {
        [Key]
        public int LessonDetailsId { get; set; }

        public int LessonId { get; set; }

        public string Content { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public Lesson Lesson { get; set; }

        [JsonIgnore]
        public ICollection<User> AccessibleUsers { get; set; }
    }
}