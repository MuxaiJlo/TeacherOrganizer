namespace TeacherOrganizer.Models.RescheduleModels
{
    public class UpdateRescheduleRequestDto
    {
        public DateTime? ProposedStartTime { get; set; }
        public DateTime? ProposedEndTime { get; set; }
        public string? NewInitiatorId { get; set; }
    }
}
