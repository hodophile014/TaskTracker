using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<TaskItem> Tasks => Set<TaskItem>();
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("User");
                entity.Property(x => x.Username).HasColumnName("username");
                entity.Property(x => x.Email).HasColumnName("email");
                entity.Property(x => x.PasswordHash).HasColumnName("password");
                entity.Property(x => x.Role).HasColumnName("role").HasMaxLength(50).HasDefaultValue("Member");
                entity.Property(x => x.IsActive).HasColumnName("isActive");
                entity.HasIndex(x => x.Email).IsUnique();
            });

            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.ToTable("TaskItem");
                entity.Property(x => x.Status).HasMaxLength(50);
                entity.Property(x => x.Priority).HasColumnName("priority").HasMaxLength(20).HasDefaultValue("Medium");
                entity.Property(x => x.IsActive).HasColumnName("isActive");

                entity.HasIndex(x => new { x.UserId, x.IsActive });
                entity.HasIndex(x => new { x.AssignedToUserId, x.IsActive });
                entity.HasIndex(x => x.Status);

                // Created by relationship (keep cascade delete to avoid unnecessary constraint recreation)
                entity.HasOne(x => x.User)
                    .WithMany(x => x.Tasks)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Assigned to relationship (restrict to avoid multiple cascade paths in SQL Server)
                entity.HasOne(x => x.AssignedToUser)
                    .WithMany(x => x.AssignedTasks)
                    .HasForeignKey(x => x.AssignedToUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
