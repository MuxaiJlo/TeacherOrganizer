using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Models.CalendarModels
{
    public class LessonUpdateModel
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Description { get; set; }
        public LessonStatus Status { get; set; }
    }

}
