namespace TeacherOrganizer.Models.LessonDetailsModels
{
    public class LessonDetailsDTO
    {
        public int LessonDetailsId { get; set; }
        public int LessonId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<string> AccessibleUserIds { get; set; } = new List<string>();
    }
}
