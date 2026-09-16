using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using TaskTrackerAPI.DTOS;

namespace TaskTrackerAPI.Hubs;

public interface ITaskClient
{
    Task TaskCreated(TaskResponseDto task);
    Task TaskUpdated(TaskResponseDto task);
    Task TaskDeleted(int taskId);
    Task TaskStatusChanged(int taskId, string newStatus);
}

[Authorize]
public class TaskHub : Hub<ITaskClient>
{
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }
}

