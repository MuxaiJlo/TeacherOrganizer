using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.CompilerServices;

namespace TeacherOrganizer.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        //Foreign key from roles
        public int RoleId { get; set; }
        [Required]
        [StringLength(100)]
        public string Username { get; set; }

        [Required]
        [StringLength(100)]
        public string PasswordHash { get; set; }

        [Required]
        [StringLength(150)]
        public string Email { get; set; }

        public DateTime CreatedAt { get; set; }

        public Role Role { get; set; }
        public ICollection<Lesson> TaughtLessons { get; set; }
        public ICollection<Lesson> AttendedLessons { get; set; }
        public ICollection<Dictionary> Dictionaries { get; set; }
    }
}
