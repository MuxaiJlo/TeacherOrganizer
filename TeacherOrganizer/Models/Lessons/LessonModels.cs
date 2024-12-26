using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Models.Lessons
{
    public class LessonModels
    {
        public string TeacherId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Description { get; set; }
        public LessonStatus Status { get; set; }
        public List<string> StudentIds { get; set; }
    }
}
