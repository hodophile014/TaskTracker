using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOS
{
    public class TaskCreateDto
    {
        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public DateTime? DueDate { get; set; }

        [MaxLength(20)]
        public string? Priority { get; set; } = "Medium";

        public int? AssignedToUserId { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; } = "To Do";
    }
}
