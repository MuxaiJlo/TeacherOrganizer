using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TeacherOrganizer.Models
{
    public class Role
    {
        public int RoleId { get; set; }
        [Required]
        [StringLength(50)]
        public string Rolename { get; set; }

        public ICollection<User> Users { get; set; }
    }
}