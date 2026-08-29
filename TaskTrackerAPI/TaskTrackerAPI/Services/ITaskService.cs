using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOS; 
namespace TaskTrackerAPI.Services
{
    public interface ITaskService
    {
        Task<List<TaskItem>> GetTasks();
        Task<TaskItem> CreateTask(TaskCreateDto dto);

        Task<TaskItem> GetTask(int id);

        Task<TaskItem> UpdateTask(TaskCreateDto dto);

        Task<TaskItem> DeleteTask(int id);

    }
}
