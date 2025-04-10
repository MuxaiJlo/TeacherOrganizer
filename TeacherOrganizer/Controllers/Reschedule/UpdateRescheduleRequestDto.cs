namespace TeacherOrganizer.Controllers.Reschedule
{
    public class UpdateRescheduleRequestDto
    {
        public DateTime? ProposedStartTime { get; set; }
        public DateTime? ProposedEndTime { get; set; }
        public string? NewInitiatorId { get; set; }
    }
}
