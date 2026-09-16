using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Services;

namespace TaskTrackerAPI.Controllers;

[ApiController, Authorize, Route("api/users")]
public class UsersController(IUservice userService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserSummaryDto>>> GetAllUsers()
    {
        var users = await userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPatch("{id:int}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(int id, UpdateUserRoleDto dto)
    {
        var success = await userService.UpdateUserRoleAsync(id, dto.Role);
        return success ? NoContent() : NotFound();
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var success = await userService.ToggleUserStatusAsync(id);
        return success ? NoContent() : NotFound();
    }
}

