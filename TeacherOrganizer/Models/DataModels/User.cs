using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace TeacherOrganizer.Models.DataModels
{
    public class User : IdentityUser
    {
        public DateTime CreatedAt { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        [JsonIgnore]
        public ICollection<Lesson> TaughtLessons { get; set; }
        [JsonIgnore]
        public ICollection<Lesson> AttendedLessons { get; set; }
        public ICollection<Dictionary> Dictionaries { get; set; }
        public int PaidLessons { get; set; } = 0;

    }
}
