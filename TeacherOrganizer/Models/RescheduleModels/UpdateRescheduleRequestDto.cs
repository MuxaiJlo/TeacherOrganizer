namespace TeacherOrganizer.Models.RescheduleModels
{
    public class UpdateRescheduleRequestDto
    {
        [FutureDate(ErrorMessage = "Proposed start time must be in the future.")]
        public DateTime? ProposedStartTime { get; set; }

        [FutureDate(ErrorMessage = "Proposed end time must be in the future.")]
        public DateTime? ProposedEndTime { get; set; }

        public string? NewInitiatorId { get; set; }
    }
}
