namespace TaskTrackerAPI.DTOS;

public record AuthResponseDto(int Id, string Name, string Email, string Role, string Token, DateTime ExpiresAtUtc);
