namespace TeacherOrganizer.Models.LessonModels
{
    public class LessonDto
    {
        public int LessonId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Description { get; set; }
    }
}
