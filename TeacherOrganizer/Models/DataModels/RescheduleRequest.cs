using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.DataModels
{
    public enum RescheduleRequestStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public class RescheduleRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int LessonId { get; set; }

        [Required]
        public Lesson Lesson { get; set; }

        [Required]
        public DateTime ProposedStartTime { get; set; }

        [Required]
        public DateTime ProposedEndTime { get; set; }

        [Required]
        public string InitiatorId { get; set; }

        public User Initiator { get; set; }

        [Required]
        public RescheduleRequestStatus RequestStatus { get; set; } = RescheduleRequestStatus.Pending;
    }

}
