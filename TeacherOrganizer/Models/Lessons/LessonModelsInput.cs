using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Models.Lessons
{
    public class LessonModelsInput
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Description { get; set; }
        public LessonStatus Status { get; set; }
        public List<string> StudentIds { get; set; }
    }
}
