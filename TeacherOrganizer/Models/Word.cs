namespace TeacherOrganizer.Models
{
    public class Word
    {
        public int ordId { get; set; }
        public int DictionaryId { get; set; }
        public string WordText { get; set; }
        public string Translation { get; set; }
        public string Example { get; set; }

        public Dictionary Dictionary { get; set; }
    }
}