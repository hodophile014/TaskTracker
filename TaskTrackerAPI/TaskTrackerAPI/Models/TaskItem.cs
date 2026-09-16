using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    public class TaskItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "To Do";

        [Required]
        [MaxLength(20)]
        public string Priority { get; set; } = "Medium";

        // Tasks are retained for audit/history purposes. A delete operation sets this
        // value to false instead of removing the row.
        public bool IsActive { get; set; } = true;

        [Required]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime DueDate { get; set; }
        public DateTime? ReminderSentAt { get; set; }

        // Creator of the task
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // Assignee of the task (defaults to creator if null)
        public int? AssignedToUserId { get; set; }
        public User? AssignedToUser { get; set; }
    }
}
