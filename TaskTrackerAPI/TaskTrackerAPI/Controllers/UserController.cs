using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services;
namespace TaskTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUservice _userService;
        public UserController(IUservice userService)
        {
            _userService = userService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateUser(CreateUserDto dto)
        {
           var user = await _userService.CreatUserAsync(dto);
            return Ok("Registration successful");
        }

    }
}
