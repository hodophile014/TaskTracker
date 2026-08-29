using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOS
{
    public class CreateUserDto
    {
        public string fname { get; set; }
        public string mname { get; set; }
        public string lname { get; set; }
        [Required]
        [EmailAddress]
        public string email { get; set; }
        [Required]
       public string password { get; set; }

    }
}
