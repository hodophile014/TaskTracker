using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Services;

namespace TaskTrackerAPI.Controllers;

[ApiController, Authorize, Route("api/tasks")]
public class TaskController(ITaskService taskService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskResponseDto>>> GetAllTasks(
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] int? assignedToId,
        [FromQuery] string? search)
    {
        var tasks = await taskService.GetTasksAsync(UserId, UserRole, status, priority, assignedToId, search);
        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskResponseDto>> GetTask(int id)
    {
        var task = await taskService.GetTaskAsync(id, UserId, UserRole);
        return task is not null ? Ok(task) : NotFound();
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> CreateTask(TaskCreateDto dto)
    {
        try
        {
            var task = await taskService.CreateTaskAsync(dto, UserId);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }
        catch (ArgumentException ex)
        {
            return ValidationProblem(ex.Message);
        }
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult<TaskResponseDto>> UpdateTask(int id, TaskUpdateDto dto)
    {
        try
        {
            var task = await taskService.UpdateTaskAsync(id, dto, UserId, UserRole);
            return task is not null ? Ok(task) : NotFound();
        }
        catch (ArgumentException ex)
        {
            return ValidationProblem(ex.Message);
        }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<TaskResponseDto>> UpdateTaskStatus(int id, TaskStatusUpdateDto dto)
    {
        var task = await taskService.UpdateTaskStatusAsync(id, dto.Status, UserId, UserRole);
        return task is not null ? Ok(task) : NotFound();
    }

    [HttpPatch("{id:int}/complete")]
    public async Task<ActionResult<TaskResponseDto>> CompleteTask(int id)
    {
        var task = await taskService.UpdateTaskStatusAsync(id, "Done", UserId, UserRole);
        return task is not null ? Ok(task) : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var deleted = await taskService.DeleteTaskAsync(id, UserId, UserRole);
        return deleted ? NoContent() : NotFound();
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string UserRole => User.FindFirstValue(ClaimTypes.Role) ?? User.FindFirstValue("role") ?? "Member";
}
