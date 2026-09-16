using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Services;

namespace TaskTrackerAPI.Controllers;

[ApiController, Authorize, Route("api/analytics")]
public class AnalyticsController(ITaskService taskService) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardAnalyticsDto>> GetDashboardAnalytics()
    {
        var analytics = await taskService.GetDashboardAnalyticsAsync(UserId, UserRole);
        return Ok(analytics);
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string UserRole => User.FindFirstValue(ClaimTypes.Role) ?? User.FindFirstValue("role") ?? "Member";
}

