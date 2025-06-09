using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Interfaces;
using TeacherOrganizer.Models.ConfigurationModels;
using TeacherOrganizer.Models.DataModels; // Changed to use Lesson from DataModels

namespace TeacherOrganizer.Servies
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly IUserService _userService;

        public EmailService(IUserService userService, IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value ?? throw new ArgumentNullException(nameof(emailSettings), "Email settings cannot be null. Please check your configuration.");
            _userService = userService;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            if (string.IsNullOrEmpty(_emailSettings.SenderEmail))
            {
                Console.Error.WriteLine("ОШИБКА КОНФИГУРАЦИИ: Email отправителя (SenderEmail) не задан.");
                throw new InvalidOperationException("SenderEmail is not configured. Cannot send email.");
            }
            if (string.IsNullOrEmpty(toEmail))
            {
                Console.Error.WriteLine($"ОШИБКА АДРЕСА ПОЛУЧАТЕЛЯ: Email получателя (toEmail) пуст или null. Тема: {subject}");
                throw new ArgumentNullException(nameof(toEmail), "Recipient email address (toEmail) cannot be null or empty.");
            }

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);

            using (var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort))
            {
                client.EnableSsl = true;
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password);
                client.TargetName = "STARTTLS/smtp.gmail.com";

                await client.SendMailAsync(mailMessage);
            }
        }

        public async Task SendLessonCreatedEmailAsync(Lesson lesson, string teacherName)
        {
            if (lesson.Students == null) return;

            foreach (var student in lesson.Students)
            {
                if (string.IsNullOrEmpty(student?.Email)) continue;

                var subject = $"New lesson: {lesson.Description ?? "Untitled"}";
                var body = $"""
                    Hello, {student.FirstName ?? student.UserName}!<br><br>
                    A new lesson <strong>{lesson.Description ?? "Untitled"}</strong> has been scheduled.<br>
                    Time: {lesson.StartTime:dd.MM.yyyy HH:mm} - {lesson.EndTime:HH:mm}<br><br>
                    Best regards,<br>{teacherName}
                    """;

                await SendEmailAsync(student.Email, subject, body);
            }
        }

        public async Task SendLessonUpdatedEmailAsync(Lesson lesson)
        {
            if (lesson.Students == null) return;

            foreach (var student in lesson.Students)
            {
                if (string.IsNullOrEmpty(student?.Email)) continue;

                var subject = $"Lesson updated: {lesson.Description ?? "Untitled"}";
                var body = $"""
                    Hello, {student.FirstName ?? student.UserName}!<br><br>
                    The lesson <strong>{lesson.Description ?? "Untitled"}</strong> has been updated.<br>
                    New time: {lesson.StartTime:dd.MM.yyyy HH:mm} - {lesson.EndTime:HH:mm}<br><br>
                    Please check the changes in your calendar.<br><br>
                    Best regards,<br>Your Teacher
                    """;

                await SendEmailAsync(student.Email, subject, body);
            }
        }

        public async Task SendLessonCanceledEmailAsync(Lesson lesson)
        {
            if (lesson.Students == null) return;

            foreach (var student in lesson.Students)
            {
                if (string.IsNullOrEmpty(student?.Email)) continue;

                var subject = $"Lesson canceled: {lesson.Description ?? "Untitled"}";
                var body = $"""
                    Hello, {student.FirstName ?? student.UserName},<br><br>
                    Unfortunately, the lesson <strong>{lesson.Description ?? "Untitled"}</strong> scheduled for
                    {lesson.StartTime:dd.MM.yyyy HH:mm} has been canceled.<br><br>
                    Please contact your teacher for more information.<br><br>
                    Best regards,<br>Your Teacher
                    """;

                await SendEmailAsync(student.Email, subject, body);
            }
        }

        public async Task SendLessonDeletedEmailAsync(Lesson lesson)
        {
            if (lesson.Students == null) return;

            foreach (var student in lesson.Students)
            {
                if (string.IsNullOrEmpty(student?.Email)) continue;

                var subject = $"Lesson deleted: {lesson.Description ?? "Untitled"}";
                var body = $"""
                    Hello, {student.FirstName ?? student.UserName},<br><br>
                    The lesson <strong>{lesson.Description ?? "Untitled"}</strong> has been deleted from the schedule.<br><br>
                    Best regards,<br>Your Teacher
                    """;

                await SendEmailAsync(student.Email, subject, body);
            }
        }
        /// <summary>
        /// Notify all students and the teacher about a proposed reschedule.
        /// </summary>
        public async Task SendRescheduleProposedEmailAsync(Lesson lesson, string initiatorName, DateTime proposedStart, DateTime proposedEnd)
        {
            if (lesson.Students != null)
            {
                foreach (var student in lesson.Students)
                {
                    if (string.IsNullOrEmpty(student?.Email)) continue;

                    var subject = $"Reschedule proposed for lesson: {lesson.Description ?? "Untitled"}";
                    var body = $"""
                        Hello, {student.FirstName ?? student.UserName}!<br><br>
                        {initiatorName} has proposed to reschedule the lesson <strong>{lesson.Description ?? "Untitled"}</strong>.<br>
                        New proposed time: {proposedStart:dd.MM.yyyy HH:mm} - {proposedEnd:HH:mm}<br><br>
                        Please review and respond to the proposal.<br><br>
                        Best regards,<br>Teacher Organizer
                        """;

                    await SendEmailAsync(student.Email, subject, body);
                }
            }

            // Notify the teacher if not the initiator
            if (lesson.Teacher != null && !string.IsNullOrEmpty(lesson.Teacher.Email) && lesson.Teacher.UserName != initiatorName)
            {
                var subject = $"Reschedule proposed for your lesson: {lesson.Description ?? "Untitled"}";
                var body = $"""
                    Hello, {lesson.Teacher.FirstName ?? lesson.Teacher.UserName}!<br><br>
                    {initiatorName} has proposed to reschedule your lesson <strong>{lesson.Description ?? "Untitled"}</strong>.<br>
                    New proposed time: {proposedStart:dd.MM.yyyy HH:mm} - {proposedEnd:HH:mm}<br><br>
                    Please review and respond to the proposal.<br><br>
                    Best regards,<br>Teacher Organizer
                    """;

                await SendEmailAsync(lesson.Teacher.Email, subject, body);
            }
        }

        /// <summary>
        /// Notify all participants about the status update of a reschedule request.
        /// </summary>
        public async Task SendRescheduleStatusUpdatedEmailAsync(Lesson lesson, string status, string updatedBy)
        {
            if (lesson.Students != null)
            {
                foreach (var student in lesson.Students)
                {
                    if (string.IsNullOrEmpty(student?.Email)) continue;

                    var subject = $"Reschedule request {status.ToLower()} for lesson: {lesson.Description ?? "Untitled"}";
                    var body = $"""
                        Hello, {student.FirstName ?? student.UserName}!<br><br>
                        The reschedule request for lesson <strong>{lesson.Description ?? "Untitled"}</strong> has been <strong>{status.ToLower()}</strong> by {updatedBy}.<br>
                        Please check your schedule for updates.<br><br>
                        Best regards,<br>Teacher Organizer
                        """;

                    await SendEmailAsync(student.Email, subject, body);
                }
            }

            if (lesson.Teacher != null && !string.IsNullOrEmpty(lesson.Teacher.Email) && lesson.Teacher.UserName != updatedBy)
            {
                var subject = $"Reschedule request {status.ToLower()} for your lesson: {lesson.Description ?? "Untitled"}";
                var body = $"""
                    Hello, {lesson.Teacher.FirstName ?? lesson.Teacher.UserName}!<br><br>
                    The reschedule request for your lesson <strong>{lesson.Description ?? "Untitled"}</strong> has been <strong>{status.ToLower()}</strong> by {updatedBy}.<br>
                    Please check your schedule for updates.<br><br>
                    Best regards,<br>Teacher Organizer
                    """;

                await SendEmailAsync(lesson.Teacher.Email, subject, body);
            }
        }

        /// <summary>
        /// Notify all participants about the deletion of a reschedule request.
        /// </summary>
        public async Task SendRescheduleDeletedEmailAsync(Lesson lesson, string deletedBy)
        {
            if (lesson.Students != null)
            {
                foreach (var student in lesson.Students)
                {
                    if (string.IsNullOrEmpty(student?.Email)) continue;

                    var subject = $"Reschedule request deleted for lesson: {lesson.Description ?? "Untitled"}";
                    var body = $"""
                        Hello, {student.FirstName ?? student.UserName}!<br><br>
                        The reschedule request for lesson <strong>{lesson.Description ?? "Untitled"}</strong> has been deleted by {deletedBy}.<br>
                        Please check your schedule for updates.<br><br>
                        Best regards,<br>Teacher Organizer
                        """;

                    await SendEmailAsync(student.Email, subject, body);
                }
            }

            if (lesson.Teacher != null && !string.IsNullOrEmpty(lesson.Teacher.Email) && lesson.Teacher.UserName != deletedBy)
            {
                var subject = $"Reschedule request deleted for your lesson: {lesson.Description ?? "Untitled"}";
                var body = $"""
                    Hello, {lesson.Teacher.FirstName ?? lesson.Teacher.UserName}!<br><br>
                    The reschedule request for your lesson <strong>{lesson.Description ?? "Untitled"}</strong> has been deleted by {deletedBy}.<br>
                    Please check your schedule for updates.<br><br>
                    Best regards,<br>Teacher Organizer
                    """;

                await SendEmailAsync(lesson.Teacher.Email, subject, body);
            }
        }

        /// <summary>
        /// Notify all participants about the update of a reschedule request.
        /// </summary>
        public async Task SendRescheduleUpdatedEmailAsync(Lesson lesson, string updatedBy, DateTime? newStart, DateTime? newEnd)
        {
            if (lesson.Students != null)
            {
                foreach (var student in lesson.Students)
                {
                    if (string.IsNullOrEmpty(student?.Email)) continue;

                    var subject = $"Reschedule request updated for lesson: {lesson.Description ?? "Untitled"}";
                    var body = $"""
                        Hello, {student.FirstName ?? student.UserName}!<br><br>
                        The reschedule request for lesson <strong>{lesson.Description ?? "Untitled"}</strong> has been updated by {updatedBy}.<br>
                        New proposed time: {newStart:dd.MM.yyyy HH:mm} - {newEnd:HH:mm}<br><br>
                        Please review the updated proposal.<br><br>
                        Best regards,<br>Teacher Organizer
                        """;

                    await SendEmailAsync(student.Email, subject, body);
                }
            }

            if (lesson.Teacher != null && !string.IsNullOrEmpty(lesson.Teacher.Email) && lesson.Teacher.UserName != updatedBy)
            {
                var subject = $"Reschedule request updated for your lesson: {lesson.Description ?? "Untitled"}";
                var body = $"""
                    Hello, {lesson.Teacher.FirstName ?? lesson.Teacher.UserName}!<br><br>
                    The reschedule request for your lesson <strong>{lesson.Description ?? "Untitled"}</strong> has been updated by {updatedBy}.<br>
                    New proposed time: {newStart:dd.MM.yyyy HH:mm} - {newEnd:HH:mm}<br><br>
                    Please review the updated proposal.<br><br>
                    Best regards,<br>Teacher Organizer
                    """;

                await SendEmailAsync(lesson.Teacher.Email, subject, body);
            }
        }
    }
}