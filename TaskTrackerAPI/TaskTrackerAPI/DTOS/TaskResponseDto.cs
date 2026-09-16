namespace TaskTrackerAPI.DTOS
{
    public class TaskResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime DueDate { get; set; }
        public int UserId { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public string CreatorEmail { get; set; } = string.Empty;
        public int? AssignedToUserId { get; set; }
        public string? AssignedToName { get; set; }
        public string? AssignedToEmail { get; set; }
    }
}
