using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOS;

public class UpdateUserRoleDto
{
    [Required]
    [RegularExpression("^(Admin|Manager|Member)$", ErrorMessage = "Role must be Admin, Manager, or Member.")]
    public string Role { get; set; } = "Member";
}

