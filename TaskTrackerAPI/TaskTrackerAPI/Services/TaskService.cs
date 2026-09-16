using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Hubs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services;

public class TaskService(
    AppDbContext context,
    IEmailService emailService,
    IHubContext<TaskHub, ITaskClient> hubContext,
    ILogger<TaskService> logger) : ITaskService
{
    public async Task<IReadOnlyList<TaskResponseDto>> GetTasksAsync(
        int currentUserId,
        string role,
        string? status = null,
        string? priority = null,
        int? assignedToId = null,
        string? search = null)
    {
        var query = context.Tasks
            .AsNoTracking()
            .Include(t => t.User)
            .Include(t => t.AssignedToUser)
            .Where(t => t.IsActive);

        // Role filtering
        if (role != "Admin" && role != "Manager")
        {
            query = query.Where(t => t.UserId == currentUserId || t.AssignedToUserId == currentUserId);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalizedStatus = NormalizeStatus(status);
            query = query.Where(t => t.Status == normalizedStatus);
        }

        if (!string.IsNullOrWhiteSpace(priority))
        {
            var normalizedPriority = NormalizePriority(priority);
            query = query.Where(t => t.Priority == normalizedPriority);
        }

        if (assignedToId.HasValue)
        {
            query = query.Where(t => t.AssignedToUserId == assignedToId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(s) || t.Description.ToLower().Contains(s));
        }

        var tasks = await query
            .OrderBy(t => t.Status == "Done" || t.Status == "Completed" ? 1 : 0)
            .ThenBy(t => t.DueDate)
            .ToListAsync();

        return tasks.Select(ToResponse).ToList();
    }

    public async Task<TaskResponseDto?> GetTaskAsync(int id, int currentUserId, string role)
    {
        var query = context.Tasks
            .AsNoTracking()
            .Include(t => t.User)
            .Include(t => t.AssignedToUser)
            .Where(t => t.Id == id && t.IsActive);

        if (role != "Admin" && role != "Manager")
        {
            query = query.Where(t => t.UserId == currentUserId || t.AssignedToUserId == currentUserId);
        }

        var task = await query.SingleOrDefaultAsync();
        return task is null ? null : ToResponse(task);
    }

    public async Task<TaskResponseDto> CreateTaskAsync(TaskCreateDto dto, int currentUserId)
    {
        var title = RequiredText(dto.Title, nameof(dto.Title));
        var description = RequiredText(dto.Description, nameof(dto.Description));
        var creator = await context.Users.SingleAsync(u => u.Id == currentUserId && u.IsActive);

        var assignedUserId = dto.AssignedToUserId ?? currentUserId;
        var assignee = await context.Users.SingleOrDefaultAsync(u => u.Id == assignedUserId && u.IsActive)
                       ?? creator;

        var task = new TaskItem
        {
            Title = title,
            Description = description,
            UserId = currentUserId,
            User = creator,
            AssignedToUserId = assignee.Id,
            AssignedToUser = assignee,
            Status = !string.IsNullOrWhiteSpace(dto.Status) ? NormalizeStatus(dto.Status) : "To Do",
            Priority = !string.IsNullOrWhiteSpace(dto.Priority) ? NormalizePriority(dto.Priority) : "Medium",
            IsActive = true,
            CreatedDate = DateTime.UtcNow,
            DueDate = dto.DueDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(7)
        };

        context.Tasks.Add(task);
        await context.SaveChangesAsync();

        var response = ToResponse(task);

        // Real-time broadcast
        try
        {
            await hubContext.Clients.All.TaskCreated(response);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to broadcast TaskCreated SignalR message.");
        }

        // Brevo email notification to assignee
        try
        {
            await emailService.SendTaskCreatedEmailAsync(
                assignee.Email,
                assignee.Username,
                task.Title,
                task.Priority,
                task.DueDate,
                creator.Username);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send task creation email for task {TaskId}.", task.Id);
        }

        return response;
    }

    public async Task<TaskResponseDto?> UpdateTaskAsync(int id, TaskUpdateDto dto, int currentUserId, string role)
    {
        var task = await context.Tasks
            .Include(t => t.User)
            .Include(t => t.AssignedToUser)
            .SingleOrDefaultAsync(t => t.Id == id && t.IsActive);

        if (task is null) return null;

        // Permissions check
        if (role != "Admin" && role != "Manager" && task.UserId != currentUserId && task.AssignedToUserId != currentUserId)
        {
            return null;
        }

        var currentUser = await context.Users.FindAsync(currentUserId);
        var updaterName = currentUser?.Username ?? "System";

        var oldStatus = task.Status;
        var statusChanged = false;

        if (dto.Title is not null) task.Title = RequiredText(dto.Title, nameof(dto.Title));
        if (dto.Description is not null) task.Description = RequiredText(dto.Description, nameof(dto.Description));
        if (dto.DueDate.HasValue) task.DueDate = dto.DueDate.Value.ToUniversalTime();

        if (dto.Priority is not null) task.Priority = NormalizePriority(dto.Priority);

        if (dto.AssignedToUserId.HasValue && dto.AssignedToUserId.Value != task.AssignedToUserId)
        {
            var newAssignee = await context.Users.SingleOrDefaultAsync(u => u.Id == dto.AssignedToUserId.Value && u.IsActive);
            if (newAssignee is not null)
            {
                task.AssignedToUserId = newAssignee.Id;
                task.AssignedToUser = newAssignee;
            }
        }

        if (dto.Status is not null)
        {
            var normalizedNewStatus = NormalizeStatus(dto.Status);
            if (task.Status != normalizedNewStatus)
            {
                statusChanged = true;
                oldStatus = task.Status;
                task.Status = normalizedNewStatus;
            }
        }

        await context.SaveChangesAsync();

        var response = ToResponse(task);

        // Real-time broadcast
        try
        {
            await hubContext.Clients.All.TaskUpdated(response);
            if (statusChanged)
            {
                await hubContext.Clients.All.TaskStatusChanged(task.Id, task.Status);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to broadcast TaskUpdated SignalR message.");
        }

        // Brevo email notification
        var recipient = task.AssignedToUser ?? task.User;
        if (recipient is not null)
        {
            try
            {
                if (statusChanged)
                {
                    await emailService.SendTaskStatusChangedEmailAsync(
                        recipient.Email,
                        recipient.Username,
                        task.Title,
                        oldStatus,
                        task.Status,
                        updaterName);
                }
                else
                {
                    await emailService.SendTaskUpdatedEmailAsync(
                        recipient.Email,
                        recipient.Username,
                        task.Title,
                        task.Status,
                        task.Priority,
                        task.DueDate,
                        updaterName);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send task update email for task {TaskId}.", task.Id);
            }
        }

        return response;
    }

    public async Task<TaskResponseDto?> UpdateTaskStatusAsync(int id, string newStatus, int currentUserId, string role)
    {
        return await UpdateTaskAsync(id, new TaskUpdateDto { Status = newStatus }, currentUserId, role);
    }

    public async Task<bool> DeleteTaskAsync(int id, int currentUserId, string role)
    {
        var task = await context.Tasks
            .Include(t => t.User)
            .Include(t => t.AssignedToUser)
            .SingleOrDefaultAsync(t => t.Id == id && t.IsActive);

        if (task is null) return false;

        // Permissions check
        if (role != "Admin" && role != "Manager" && task.UserId != currentUserId)
        {
            return false;
        }

        task.IsActive = false;
        await context.SaveChangesAsync();

        var currentUser = await context.Users.FindAsync(currentUserId);
        var deleterName = currentUser?.Username ?? "System";

        // SignalR broadcast
        try
        {
            await hubContext.Clients.All.TaskDeleted(task.Id);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to broadcast TaskDeleted SignalR message.");
        }

        // Brevo email notification
        var notifyUser = task.AssignedToUser ?? task.User;
        if (notifyUser is not null)
        {
            try
            {
                await emailService.SendTaskDeletedEmailAsync(notifyUser.Email, notifyUser.Username, task.Title, deleterName);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send task deletion email for task {TaskId}.", task.Id);
            }
        }

        return true;
    }

    public async Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(int currentUserId, string role)
    {
        var query = context.Tasks
            .AsNoTracking()
            .Include(t => t.User)
            .Include(t => t.AssignedToUser)
            .Where(t => t.IsActive);

        if (role != "Admin" && role != "Manager")
        {
            query = query.Where(t => t.UserId == currentUserId || t.AssignedToUserId == currentUserId);
        }

        var tasks = await query.ToListAsync();
        var now = DateTime.UtcNow;

        var total = tasks.Count;
        var completed = tasks.Count(t => t.Status == "Done" || t.Status == "Completed");
        var inProgress = tasks.Count(t => t.Status == "In Progress");
        var inReview = tasks.Count(t => t.Status == "In Review");
        var toDo = tasks.Count(t => t.Status == "To Do" || t.Status == "Pending");
        var overdue = tasks.Count(t => (t.Status != "Done" && t.Status != "Completed") && t.DueDate < now);

        var rate = total > 0 ? Math.Round((double)completed / total * 100, 1) : 0;

        var byPriority = new Dictionary<string, int>
        {
            ["Urgent"] = tasks.Count(t => t.Priority == "Urgent"),
            ["High"] = tasks.Count(t => t.Priority == "High"),
            ["Medium"] = tasks.Count(t => t.Priority == "Medium"),
            ["Low"] = tasks.Count(t => t.Priority == "Low")
        };

        var byStatus = new Dictionary<string, int>
        {
            ["To Do"] = toDo,
            ["In Progress"] = inProgress,
            ["In Review"] = inReview,
            ["Done"] = completed
        };

        // Workload distribution
        var users = await context.Users.AsNoTracking().Where(u => u.IsActive).ToListAsync();
        var workload = users.Select(u => new UserWorkloadDto
        {
            UserId = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role,
            AssignedCount = tasks.Count(t => t.AssignedToUserId == u.Id),
            CompletedCount = tasks.Count(t => t.AssignedToUserId == u.Id && (t.Status == "Done" || t.Status == "Completed"))
        }).Where(w => w.AssignedCount > 0 || role == "Admin" || role == "Manager")
          .OrderByDescending(w => w.AssignedCount)
          .Take(10)
          .ToList();

        var upcoming = tasks
            .Where(t => t.Status != "Done" && t.Status != "Completed" && t.DueDate >= now)
            .OrderBy(t => t.DueDate)
            .Take(5)
            .Select(ToResponse)
            .ToList();

        var recent = tasks
            .OrderByDescending(t => t.CreatedDate)
            .Take(5)
            .Select(ToResponse)
            .ToList();

        return new DashboardAnalyticsDto
        {
            TotalTasks = total,
            ToDoTasks = toDo,
            InProgressTasks = inProgress,
            InReviewTasks = inReview,
            CompletedTasks = completed,
            OverdueTasks = overdue,
            CompletionRate = rate,
            TasksByPriority = byPriority,
            TasksByStatus = byStatus,
            TeamWorkload = workload,
            UpcomingDeadlines = upcoming,
            RecentTasks = recent
        };
    }

    private static string NormalizeStatus(string status) => status.Trim().ToLowerInvariant() switch
    {
        "todo" or "to do" or "pending" => "To Do",
        "inprogress" or "in progress" or "in-progress" => "In Progress",
        "inreview" or "in review" or "in-review" or "review" => "In Review",
        "done" or "completed" => "Done",
        _ => "To Do"
    };

    private static string NormalizePriority(string priority) => priority.Trim().ToLowerInvariant() switch
    {
        "urgent" => "Urgent",
        "high" => "High",
        "medium" => "Medium",
        "low" => "Low",
        _ => "Medium"
    };

    private static string RequiredText(string value, string name) =>
        !string.IsNullOrWhiteSpace(value) ? value.Trim() : throw new ArgumentException($"{name} is required.");

    private static TaskResponseDto ToResponse(TaskItem task) => new()
    {
        Id = task.Id,
        Title = task.Title,
        Description = task.Description,
        Status = task.Status == "Completed" ? "Done" : (task.Status == "Pending" ? "To Do" : task.Status),
        Priority = task.Priority,
        CreatedDate = task.CreatedDate,
        DueDate = task.DueDate,
        UserId = task.UserId,
        CreatorName = task.User?.Username ?? "Unknown",
        CreatorEmail = task.User?.Email ?? string.Empty,
        AssignedToUserId = task.AssignedToUserId,
        AssignedToName = task.AssignedToUser?.Username ?? task.User?.Username,
        AssignedToEmail = task.AssignedToUser?.Email ?? task.User?.Email
    };
}
