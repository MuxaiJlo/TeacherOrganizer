using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.ViewModels
{
    public class MainViewModel
    {
        public string Username { get; set; }
        public string UserId { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }
        public string Role { get; set; }
        public DateTime LoginTime { get; set; }
    }
}
