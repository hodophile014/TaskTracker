using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Models;


namespace TaskTrackerAPI.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions <AppDbContext> options) : base(options)
        {

        }
        public DbSet<TaskItem> TaskItem { get; set; }
        public DbSet<User> User { get; set; }
        
    }
}
