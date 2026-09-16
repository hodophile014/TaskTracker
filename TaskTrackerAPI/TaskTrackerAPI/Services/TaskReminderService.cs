using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;

namespace TaskTrackerAPI.Services;

public class TaskReminderService(IServiceScopeFactory scopeFactory, ILogger<TaskReminderService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await SendDueSoonRemindersAsync(stoppingToken);
        }
    }

    private async Task SendDueSoonRemindersAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var now = DateTime.UtcNow;
            var tasks = await context.Tasks
                .Include(x => x.User)
                .Include(x => x.AssignedToUser)
                .Where(x => x.IsActive &&
                            x.Status != "Completed" &&
                            x.Status != "Done" &&
                            x.ReminderSentAt == null &&
                            x.DueDate > now &&
                            x.DueDate <= now.AddHours(1))
                .ToListAsync(cancellationToken);

            foreach (var task in tasks)
            {
                var recipient = task.AssignedToUser ?? task.User;
                if (recipient is null) continue;

                var body = $@"
                    <div style=""background: #fff7ed; border-left: 4px solid #f97316; padding: 16px; border-radius: 6px; margin: 16px 0;"">
                        <p style=""margin: 0; color: #9a3412; font-weight: 600;"">Urgent: This task is due within one hour!</p>
                    </div>
                    <ul style=""list-style: none; padding: 0; font-size: 14px;"">
                        <li style=""margin-bottom: 8px;""><strong>Title:</strong> {System.Net.WebUtility.HtmlEncode(task.Title)}</li>
                        <li style=""margin-bottom: 8px;""><strong>Status:</strong> {task.Status}</li>
                        <li style=""margin-bottom: 8px;""><strong>Priority:</strong> {task.Priority}</li>
                        <li style=""margin-bottom: 8px;""><strong>Due:</strong> {task.DueDate:MMM dd, yyyy HH:mm} UTC</li>
                    </ul>";

                try
                {
                    if (await emailService.SendTaskNotificationAsync(recipient.Email, recipient.Username, $"Reminder: Task '{task.Title}' due soon", body))
                    {
                        task.ReminderSentAt = DateTime.UtcNow;
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Could not send due-soon reminder for task {TaskId}.", task.Id);
                }
            }

            await context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogError(ex, "Could not process task reminders.");
        }
    }
}
