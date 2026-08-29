using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services;
namespace TaskTrackerAPI.Controllers
{
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;
        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _taskService.GetTasks(); 
            return Ok(tasks);
        }
        [HttpGet("{id}")]
        public IActionResult GetTask(int id)
        {
            var task = _taskService.GetTask(id);
            return Ok(task);
        }
        [HttpPost]
        public IActionResult CreateTask(TaskCreateDto dto)
        {  var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                Status = "Pending"
                
            };
            return Ok();
        }

        [HttpPatch("{id}")]
        public IActionResult UpdateTask(int id)
        {
            return Ok();
        }
        [HttpDelete("{id}")]
        public IActionResult DeleteTask(int id)
        {
            return Ok();

        }

    }
}
