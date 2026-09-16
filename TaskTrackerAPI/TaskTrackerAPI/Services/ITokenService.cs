using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Models;
namespace TaskTrackerAPI.Services;
public interface ITokenService { AuthResponseDto CreateToken(User user); }
