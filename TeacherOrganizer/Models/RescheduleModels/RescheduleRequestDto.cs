using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Models.RescheduleModels
{
    public class RescheduleRequestDto
    {
        public int Id { get; set; }

        public int LessonId { get; set; }

        public DateTime ProposedStartTime { get; set; }

        public DateTime ProposedEndTime { get; set; }

        public RescheduleRequestStatus RequestStatus { get; set; }

        public LessonInfoDto Lesson { get; set; }

        public UserInfoDto Initiator { get; set; }
    }

    public class LessonInfoDto
    {
        public int LessonId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Description { get; set; }
    }

    public class UserInfoDto
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

}
