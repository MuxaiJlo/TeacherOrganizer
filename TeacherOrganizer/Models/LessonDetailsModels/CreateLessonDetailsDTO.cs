namespace TeacherOrganizer.Models.LessonDetailsModels
{
    public class CreateLessonDetailsDTO
    {
        public int LessonId { get; set; }
        public string Content { get; set; }
        public List<string> AccessibleUserIds { get; set; } = new List<string>();
    }
}
