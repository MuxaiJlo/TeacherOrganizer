using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.UserModels
{
    public class UserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public int PaidLessons { get; set; }
        public int CompletedLessonsCount { get; set; } 
        public int ScheduledLessonsCount { get; set; } 
    }
    // Модель для налаштувань користувача
    public class UserSettingsDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public int PaidLessons { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Roles { get; set; }
    }

    // Модель для оновлення налаштувань
    public class UserSettingsUpdateDto
    {
        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public string UserName { get; set; }
    }

    // Модель для зміни паролю
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; }
    }
    public class UserWithRolesDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Roles { get; set; }
    }

}