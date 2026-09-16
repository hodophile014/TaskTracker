using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOS;

public class TaskUpdateDto
{
    [MaxLength(500)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    [MaxLength(50)]
    public string? Status { get; set; }

    [MaxLength(20)]
    public string? Priority { get; set; }

    public int? AssignedToUserId { get; set; }
}
