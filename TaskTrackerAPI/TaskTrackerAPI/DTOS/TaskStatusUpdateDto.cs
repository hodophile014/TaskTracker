using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOS;

public class TaskStatusUpdateDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}

