using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace TaskTrackerAPI.DTOS
{
    public class TaskResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public bool Status { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime DueDate { get; set; }
        public int UserId { get; set; }
    }
}
