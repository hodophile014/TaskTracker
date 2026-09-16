using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services;

public class UserService(
    AppDbContext context,
    IPasswordHasher<User> passwordHasher,
    ITokenService tokenService,
    IEmailService emailService,
    ILogger<UserService> logger) : IUservice
{
    public async Task<AuthResponseDto> RegisterAsync(CreateUserDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await context.Users.AnyAsync(x => x.Email == email))
            throw new InvalidOperationException("An account with this email already exists.");

        var name = string.Join(' ', new[] { dto.FirstName, dto.MiddleName, dto.LastName }
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!.Trim()));

        // The first registered user in the system automatically gets Admin role
        var isFirstUser = !await context.Users.AnyAsync();
        var requestedRole = !string.IsNullOrWhiteSpace(dto.Role) ? NormalizeRole(dto.Role) : "Member";
        var assignedRole = isFirstUser ? "Admin" : requestedRole;

        var user = new User
        {
            Username = name,
            Email = email,
            Role = assignedRole,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);

        context.Users.Add(user);
        await context.SaveChangesAsync();

        try
        {
            await emailService.SendAccountCreatedEmailAsync(user.Email, user.Username);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Could not send account-created email to {Email}.", user.Email);
        }

        return tokenService.CreateToken(user);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await context.Users.SingleOrDefaultAsync(x => x.Email == dto.Email.Trim().ToLowerInvariant());
        if (user is null || !user.IsActive)
            return null;

        var verify = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        return verify == PasswordVerificationResult.Failed ? null : tokenService.CreateToken(user);
    }

    public async Task<UserSummaryDto?> GetCurrentUserAsync(int userId)
    {
        var user = await context.Users
            .AsNoTracking()
            .Include(u => u.AssignedTasks)
            .SingleOrDefaultAsync(x => x.Id == userId);

        if (user is null) return null;

        return new UserSummaryDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            TaskCount = user.AssignedTasks.Count(t => t.IsActive)
        };
    }

    public async Task<IReadOnlyList<UserSummaryDto>> GetAllUsersAsync()
    {
        var users = await context.Users
            .AsNoTracking()
            .Include(u => u.AssignedTasks)
            .OrderBy(u => u.Username)
            .ToListAsync();

        return users.Select(u => new UserSummaryDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            TaskCount = u.AssignedTasks.Count(t => t.IsActive)
        }).ToList();
    }

    public async Task<bool> UpdateUserRoleAsync(int targetUserId, string newRole)
    {
        var user = await context.Users.FindAsync(targetUserId);
        if (user is null) return false;

        user.Role = NormalizeRole(newRole);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleUserStatusAsync(int targetUserId)
    {
        var user = await context.Users.FindAsync(targetUserId);
        if (user is null) return false;

        user.IsActive = !user.IsActive;
        await context.SaveChangesAsync();
        return true;
    }

    private static string NormalizeRole(string role) => role.Trim().ToLowerInvariant() switch
    {
        "admin" => "Admin",
        "manager" => "Manager",
        "member" => "Member",
        _ => "Member"
    };
}
