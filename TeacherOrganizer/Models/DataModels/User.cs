using Microsoft.AspNetCore.Identity;

namespace TeacherOrganizer.Models.DataModels
{
    public class User : IdentityUser
    {
        public DateTime CreatedAt { get; set; }

        public ICollection<Lesson> TaughtLessons { get; set; }
        public ICollection<Lesson> AttendedLessons { get; set; }
        public ICollection<Dictionary> Dictionaries { get; set; }
    }
}
