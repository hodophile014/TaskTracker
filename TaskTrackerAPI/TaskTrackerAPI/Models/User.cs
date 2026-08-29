using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class User
    {
        [Key]
         public int Id { get; set; }
        [Required]
        public string username { get; set; }
        [EmailAddress]
        public string email { get; set; }


        public string password { get; set; }
        public bool isActive { get; set; }



    }
}
