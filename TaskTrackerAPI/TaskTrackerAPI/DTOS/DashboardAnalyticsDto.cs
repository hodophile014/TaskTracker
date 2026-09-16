namespace TaskTrackerAPI.DTOS;

public class DashboardAnalyticsDto
{
    public int TotalTasks { get; set; }
    public int ToDoTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int InReviewTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double CompletionRate { get; set; }

    public Dictionary<string, int> TasksByPriority { get; set; } = new();
    public Dictionary<string, int> TasksByStatus { get; set; } = new();
    public List<UserWorkloadDto> TeamWorkload { get; set; } = new();
    public List<TaskResponseDto> UpcomingDeadlines { get; set; } = new();
    public List<TaskResponseDto> RecentTasks { get; set; } = new();
}

public class UserWorkloadDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int AssignedCount { get; set; }
    public int CompletedCount { get; set; }
}

