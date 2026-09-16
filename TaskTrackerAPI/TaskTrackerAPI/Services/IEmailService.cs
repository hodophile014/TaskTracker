namespace TaskTrackerAPI.Services;

public interface IEmailService
{
    Task<bool> SendAccountCreatedEmailAsync(string recipientEmail, string recipientName);
    Task<bool> SendTaskCreatedEmailAsync(string recipientEmail, string recipientName, string taskTitle, string priority, DateTime dueDate, string creatorName);
    Task<bool> SendTaskUpdatedEmailAsync(string recipientEmail, string recipientName, string taskTitle, string status, string priority, DateTime dueDate, string updatedBy);
    Task<bool> SendTaskStatusChangedEmailAsync(string recipientEmail, string recipientName, string taskTitle, string oldStatus, string newStatus, string updatedBy);
    Task<bool> SendTaskDeletedEmailAsync(string recipientEmail, string recipientName, string taskTitle, string deletedBy);
    Task<bool> SendTaskNotificationAsync(string recipientEmail, string recipientName, string subject, string htmlBody);
}
