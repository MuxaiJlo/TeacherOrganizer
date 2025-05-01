using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.RescheduleModels
{
    public class FutureDateAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is DateTime dateTime)
            {
                return dateTime > DateTime.UtcNow;
            }
            return false;
        }
    }
}
