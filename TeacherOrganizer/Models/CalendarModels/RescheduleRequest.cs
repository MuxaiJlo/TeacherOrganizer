using System.ComponentModel.DataAnnotations;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Models.CalendarModels
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

        public int LessonId { get; set; }

        public Lesson Lesson { get; set; }

        public DateTime ProposedStartTime { get; set; }

        public DateTime ProposedEndTime { get; set; }

        public string InitiatorId { get; set; }

        public User Initiator { get; set; }

        public RescheduleRequestStatus RequestStatus { get; set; } = RescheduleRequestStatus.Pending;
    }

}
