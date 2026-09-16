using TaskTrackerAPI.DTOS;

namespace TaskTrackerAPI.Services;

public interface IUservice
{
    Task<AuthResponseDto> RegisterAsync(CreateUserDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<UserSummaryDto?> GetCurrentUserAsync(int userId);
    Task<IReadOnlyList<UserSummaryDto>> GetAllUsersAsync();
    Task<bool> UpdateUserRoleAsync(int targetUserId, string newRole);
    Task<bool> ToggleUserStatusAsync(int targetUserId);
}
