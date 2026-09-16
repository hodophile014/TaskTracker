using TaskTrackerAPI.DTOS;

namespace TaskTrackerAPI.Services;

public interface ITaskService
{
    Task<IReadOnlyList<TaskResponseDto>> GetTasksAsync(
        int currentUserId,
        string role,
        string? status = null,
        string? priority = null,
        int? assignedToId = null,
        string? search = null);

    Task<TaskResponseDto?> GetTaskAsync(int id, int currentUserId, string role);

    Task<TaskResponseDto> CreateTaskAsync(TaskCreateDto dto, int currentUserId);

    Task<TaskResponseDto?> UpdateTaskAsync(int id, TaskUpdateDto dto, int currentUserId, string role);

    Task<TaskResponseDto?> UpdateTaskStatusAsync(int id, string newStatus, int currentUserId, string role);

    Task<bool> DeleteTaskAsync(int id, int currentUserId, string role);

    Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(int currentUserId, string role);
}
