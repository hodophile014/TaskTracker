using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace TaskTrackerAPI.Services;

public class BrevoEmailService(IOptions<SmtpOptions> options, ILogger<BrevoEmailService> logger) : IEmailService
{
    private readonly SmtpOptions _options = options.Value;

    public async Task<bool> SendAccountCreatedEmailAsync(string recipientEmail, string recipientName)
    {
        var encodedName = WebUtility.HtmlEncode(recipientName);
        var body = $@"
            <div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;"">
                <div style=""background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff;"">
                    <h1 style=""margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;"">Welcome to TaskTracker</h1>
                    <p style=""margin: 8px 0 0; opacity: 0.9; font-size: 15px;"">Full-Stack Task & Project Lifecycle Management</p>
                </div>
                <div style=""padding: 32px 24px; color: #334155; line-height: 1.6;"">
                    <p style=""font-size: 16px; margin-top: 0;"">Hello <strong>{encodedName}</strong>,</p>
                    <p>Your TaskTracker account has been created successfully! You can now log in, collaborate with your team, assign tasks, track priorities, and monitor project workflows seamlessly.</p>
                    <div style=""margin: 24px 0; background: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 6px;"">
                        <p style=""margin: 0; font-weight: 600; color: #1e293b;"">Account Details:</p>
                        <p style=""margin: 4px 0 0; color: #64748b; font-size: 14px;"">Email: {WebUtility.HtmlEncode(recipientEmail)}</p>
                    </div>
                    <p>Get started by exploring your dashboard and organizing your tasks.</p>
                </div>
                <div style=""background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;"">
                    <p style=""margin: 0;"">TaskTracker Notification Service &bull; Powered by Brevo</p>
                </div>
            </div>";

        return await SendEmailAsync(recipientEmail, "Welcome to TaskTracker - Account Created", body);
    }

    public async Task<bool> SendTaskCreatedEmailAsync(string recipientEmail, string recipientName, string taskTitle, string priority, DateTime dueDate, string creatorName)
    {
        var priorityColor = GetPriorityColor(priority);
        var body = $@"
            <div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;"">
                <div style=""background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 28px 24px; color: #ffffff;"">
                    <h2 style=""margin: 0; font-size: 22px; font-weight: 700;"">New Task Assigned</h2>
                    <p style=""margin: 6px 0 0; opacity: 0.9; font-size: 14px;"">Created by {WebUtility.HtmlEncode(creatorName)}</p>
                </div>
                <div style=""padding: 28px 24px; color: #334155; line-height: 1.6;"">
                    <p style=""font-size: 15px; margin-top: 0;"">Hello <strong>{WebUtility.HtmlEncode(recipientName)}</strong>,</p>
                    <p>A new task has been assigned to you on TaskTracker:</p>
                    <div style=""background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;"">
                        <h3 style=""margin: 0 0 12px; color: #0f172a; font-size: 18px;"">{WebUtility.HtmlEncode(taskTitle)}</h3>
                        <table style=""width: 100%; border-collapse: collapse; font-size: 14px;"">
                            <tr>
                                <td style=""padding: 6px 0; color: #64748b; width: 100px;"">Priority:</td>
                                <td style=""padding: 6px 0;""><span style=""background: {priorityColor.bg}; color: {priorityColor.text}; padding: 3px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px;"">{priority}</span></td>
                            </tr>
                            <tr>
                                <td style=""padding: 6px 0; color: #64748b;"">Due Date:</td>
                                <td style=""padding: 6px 0; font-weight: 500;"">{dueDate:MMM dd, yyyy HH:mm} UTC</td>
                            </tr>
                            <tr>
                                <td style=""padding: 6px 0; color: #64748b;"">Status:</td>
                                <td style=""padding: 6px 0; font-weight: 500;"">To Do</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div style=""background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;"">
                    <p style=""margin: 0;"">TaskTracker &bull; Brevo Transactional Email</p>
                </div>
            </div>";

        return await SendEmailAsync(recipientEmail, $"Task Assigned: {taskTitle}", body);
    }

    public async Task<bool> SendTaskUpdatedEmailAsync(string recipientEmail, string recipientName, string taskTitle, string status, string priority, DateTime dueDate, string updatedBy)
    {
        var priorityColor = GetPriorityColor(priority);
        var body = $@"
            <div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;"">
                <div style=""background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%); padding: 28px 24px; color: #ffffff;"">
                    <h2 style=""margin: 0; font-size: 22px; font-weight: 700;"">Task Updated</h2>
                    <p style=""margin: 6px 0 0; opacity: 0.9; font-size: 14px;"">Updated by {WebUtility.HtmlEncode(updatedBy)}</p>
                </div>
                <div style=""padding: 28px 24px; color: #334155; line-height: 1.6;"">
                    <p style=""font-size: 15px; margin-top: 0;"">Hello <strong>{WebUtility.HtmlEncode(recipientName)}</strong>,</p>
                    <p>Details for the task <strong>""{WebUtility.HtmlEncode(taskTitle)}""</strong> have been updated:</p>
                    <div style=""background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;"">
                        <table style=""width: 100%; border-collapse: collapse; font-size: 14px;"">
                            <tr>
                                <td style=""padding: 6px 0; color: #64748b; width: 100px;"">Status:</td>
                                <td style=""padding: 6px 0; font-weight: 600; color: #0f172a;"">{status}</td>
                            </tr>
                            <tr>
                                <td style=""padding: 6px 0; color: #64748b;"">Priority:</td>
                                <td style=""padding: 6px 0;""><span style=""background: {priorityColor.bg}; color: {priorityColor.text}; padding: 3px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px;"">{priority}</span></td>
                            </tr>
                            <tr>
                                <td style=""padding: 6px 0; color: #64748b;"">Due Date:</td>
                                <td style=""padding: 6px 0; font-weight: 500;"">{dueDate:MMM dd, yyyy HH:mm} UTC</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div style=""background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;"">
                    <p style=""margin: 0;"">TaskTracker &bull; Brevo Transactional Email</p>
                </div>
            </div>";

        return await SendEmailAsync(recipientEmail, $"Task Updated: {taskTitle}", body);
    }

    public async Task<bool> SendTaskStatusChangedEmailAsync(string recipientEmail, string recipientName, string taskTitle, string oldStatus, string newStatus, string updatedBy)
    {
        var statusColor = newStatus == "Done" || newStatus == "Completed" ? "#16a34a" : "#2563eb";
        var body = $@"
            <div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;"">
                <div style=""background: linear-gradient(135deg, {statusColor} 0%, #3b82f6 100%); padding: 28px 24px; color: #ffffff;"">
                    <h2 style=""margin: 0; font-size: 22px; font-weight: 700;"">Task Status Changed</h2>
                    <p style=""margin: 6px 0 0; opacity: 0.9; font-size: 14px;"">{oldStatus} &rarr; {newStatus}</p>
                </div>
                <div style=""padding: 28px 24px; color: #334155; line-height: 1.6;"">
                    <p style=""font-size: 15px; margin-top: 0;"">Hello <strong>{WebUtility.HtmlEncode(recipientName)}</strong>,</p>
                    <p>The task <strong>""{WebUtility.HtmlEncode(taskTitle)}""</strong> status has moved from <em>{oldStatus}</em> to <strong>{newStatus}</strong> (updated by {WebUtility.HtmlEncode(updatedBy)}).</p>
                </div>
                <div style=""background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;"">
                    <p style=""margin: 0;"">TaskTracker &bull; Brevo Transactional Email</p>
                </div>
            </div>";

        return await SendEmailAsync(recipientEmail, $"Status Changed to '{newStatus}': {taskTitle}", body);
    }

    public async Task<bool> SendTaskDeletedEmailAsync(string recipientEmail, string recipientName, string taskTitle, string deletedBy)
    {
        var body = $@"
            <div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;"">
                <div style=""background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 28px 24px; color: #ffffff;"">
                    <h2 style=""margin: 0; font-size: 22px; font-weight: 700;"">Task Deleted</h2>
                    <p style=""margin: 6px 0 0; opacity: 0.9; font-size: 14px;"">Removed by {WebUtility.HtmlEncode(deletedBy)}</p>
                </div>
                <div style=""padding: 28px 24px; color: #334155; line-height: 1.6;"">
                    <p style=""font-size: 15px; margin-top: 0;"">Hello <strong>{WebUtility.HtmlEncode(recipientName)}</strong>,</p>
                    <p>The task <strong>""{WebUtility.HtmlEncode(taskTitle)}""</strong> has been removed from active tasks.</p>
                </div>
                <div style=""background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;"">
                    <p style=""margin: 0;"">TaskTracker &bull; Brevo Transactional Email</p>
                </div>
            </div>";

        return await SendEmailAsync(recipientEmail, $"Task Deleted: {taskTitle}", body);
    }

    public Task<bool> SendTaskNotificationAsync(string recipientEmail, string recipientName, string subject, string htmlBody) =>
        SendEmailAsync(recipientEmail, subject, $"<div style=\"font-family: 'Segoe UI', Arial, sans-serif; padding: 20px;\"><p>Hello {WebUtility.HtmlEncode(recipientName)},</p>{htmlBody}</div>");

    private static readonly HttpClient _httpClient = new();

    private async Task<bool> SendEmailAsync(string recipientEmail, string subject, string htmlBody)
    {
        var apiKey = !string.IsNullOrWhiteSpace(_options.ApiKey)
            ? _options.ApiKey
            : (!string.IsNullOrWhiteSpace(_options.Password) && _options.Password.StartsWith("xkeysib-") ? _options.Password : null);

        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                var payload = new
                {
                    sender = new { name = _options.FromName, email = _options.FromEmail },
                    to = new[] { new { email = recipientEmail } },
                    subject,
                    htmlContent = htmlBody
                };

                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
                request.Headers.Add("api-key", apiKey);
                request.Content = System.Net.Http.Json.JsonContent.Create(payload);

                var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    logger.LogInformation("Transactional email successfully sent via Brevo HTTP API to {RecipientEmail} with subject: {Subject}", recipientEmail, subject);
                    return true;
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                logger.LogWarning("Brevo HTTP API returned status {StatusCode}: {ErrorContent}", response.StatusCode, errorContent);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Brevo HTTP API request failed for {RecipientEmail}.", recipientEmail);
            }
        }

        if (string.IsNullOrWhiteSpace(_options.Username) ||
            string.IsNullOrWhiteSpace(_options.Password) ||
            string.IsNullOrWhiteSpace(_options.FromEmail))
        {
            logger.LogWarning("Email was not sent because Brevo SMTP settings are incomplete.");
            return false;
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(_options.FromEmail, _options.FromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(recipientEmail);

            using var smtpClient = new SmtpClient(_options.SmtpHost, _options.SmtpPort)
            {
                EnableSsl = _options.UseSsl,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_options.Username, _options.Password),
                Timeout = 15000 // 15 seconds timeout
            };

            await smtpClient.SendMailAsync(message);
            logger.LogInformation("Transactional email successfully sent via Brevo to {RecipientEmail} with subject: {Subject}", recipientEmail, subject);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to deliver Brevo email to {RecipientEmail} for subject '{Subject}'. Reason: {Error}", recipientEmail, subject, ex.Message);
            return false;
        }
    }

    private static (string bg, string text) GetPriorityColor(string priority) => priority.ToLowerInvariant() switch
    {
        "urgent" => ("#fee2e2", "#b91c1c"),
        "high" => ("#ffedd5", "#c2410c"),
        "medium" => ("#fef3c7", "#b45309"),
        "low" => ("#e0f2fe", "#0369a1"),
        _ => ("#f1f5f9", "#475569")
    };
}
