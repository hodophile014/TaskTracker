namespace TaskTrackerAPI.DTOS;

public class UserSummaryDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Member";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public int TaskCount { get; set; }
}

