using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.AuthModels
{
    public class ForgotPasswordModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
