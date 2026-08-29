using Microsoft.EntityFrameworkCore;
    using TaskTrackerAPI.Data;
    using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Models;
namespace TaskTrackerAPI.Services
{
    public class TaskService: ITaskService
    {
        private readonly AppDbContext _context;
        public TaskService(AppDbContext context) {
            _context = context;
        }
        public async Task<List<TaskItem>> GetTasks()
        {
            return await _context.TaskItem.ToListAsync();
        }
        public async Task<TaskItem> GetTask(int id)
        {
            return await _context.TaskItem.FindAsync(id);
        }
        public async Task<TaskItem> CreateTask(TaskCreateDto dto)
        {
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                
                Status = dto.Status ? "Completed" : "Pending",
            };
            _context.TaskItem.Add(task);
            await _context.SaveChangesAsync();
            return task;

        }
        public async Task<TaskItem> UpdateTask(TaskCreateDto dto)
        {
            var task = await _context.TaskItem.FindAsync(dto.Id);
            if (task == null)
            {
                return null;
            }
            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Status = dto.Status ? "Completed" : "Pending";
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<TaskItem> DeleteTask(int id)
        {
            var task = await _context.TaskItem.FindAsync(id);
            if (task == null)
            {
                return null;
            }
            _context.TaskItem.Remove(task);
            await _context.SaveChangesAsync();
            return task;
        }

    }
}
