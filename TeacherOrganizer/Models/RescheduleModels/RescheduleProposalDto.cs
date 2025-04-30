namespace TeacherOrganizer.Models.RescheduleModels
{
    public class RescheduleProposalDto
    {
        public int LessonId { get; set; }
        public DateTime ProposedStartTime { get; set; }
        public DateTime ProposedEndTime { get; set; }
    }
}
