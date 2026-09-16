using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services;

public class TokenService(IConfiguration configuration) : ITokenService
{
    public AuthResponseDto CreateToken(User user)
    {
        var jwt = configuration.GetSection("Jwt");
        var expires = DateTime.UtcNow.AddHours(jwt.GetValue<int?>("ExpiresHours") ?? 8);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.")));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("role", user.Role)
        };

        var token = new JwtSecurityToken(
            jwt["Issuer"],
            jwt["Audience"],
            claims,
            expires: expires,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new AuthResponseDto(
            user.Id,
            user.Username,
            user.Email,
            user.Role,
            new JwtSecurityTokenHandler().WriteToken(token),
            expires);
    }
}
