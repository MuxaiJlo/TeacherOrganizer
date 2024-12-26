﻿using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models.DictionaryModels
{
    public class WordUpdateModel
    {
        [Required]
        public int DictionaryId { get; set; }

        [Required]
        public string Text { get; set; }

        public string Translation { get; set; }
        public string Example { get; set; }
    }

}
