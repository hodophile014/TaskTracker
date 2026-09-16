using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Services;

namespace TaskTrackerAPI.Controllers;

[ApiController, Route("api/auth")]
public class UserController(IUservice userService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(CreateUserDto dto)
    {
        try
        {
            return Ok(await userService.RegisterAsync(dto));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var auth = await userService.LoginAsync(dto);
        return auth is not null ? Ok(auth) : Unauthorized(new { message = "Invalid email or password." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserSummaryDto>> GetCurrentUser()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await userService.GetCurrentUserAsync(userId);
        return user is not null ? Ok(user) : NotFound();
    }
}
