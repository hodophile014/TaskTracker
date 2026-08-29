using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services
{
    public interface IUservice
    {
        Task<User> CreatUserAsync(CreateUserDto dto);
    }
}
