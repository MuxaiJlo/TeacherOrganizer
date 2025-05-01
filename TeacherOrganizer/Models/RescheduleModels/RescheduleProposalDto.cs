using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.RescheduleModels
{
    public class RescheduleProposalDto
    {
        [Required]
        public int LessonId { get; set; }

        [Required]
        [FutureDate(ErrorMessage = "Proposed start time must be in the future.")]
        public DateTime ProposedStartTime { get; set; }

        [Required]
        [FutureDate(ErrorMessage = "Proposed end time must be in the future.")]
        public DateTime ProposedEndTime { get; set; }
    }
}
