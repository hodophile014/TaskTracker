using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class User
    {
        [Key]
         public int Id { get; set; }
        [Required, MaxLength(200)]
        public string Username { get; set; } = string.Empty;
        [EmailAddress]
        [Required, MaxLength(320)]
        public string Email { get; set; } = string.Empty;


        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        [Required, MaxLength(50)]
        public string Role { get; set; } = "Member";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();



    }
}
