using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOS
{
    public class TaskCreateDto
    {
        public int Id { get; set; }
        [Required]
        [MaxLength(500)]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public bool Status { get; set; }

        public int UserId { get; set; }

    }
}
