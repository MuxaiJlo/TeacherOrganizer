using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using TeacherOrganizer.Interfaces;
using TeacherOrganizer.Models.ConfigurationModels;

namespace TeacherOrganizer.Servies
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;

            // ВРЕМЕННАЯ ОТЛАДКА: Проверить загруженные настройки
            Console.WriteLine($"DEBUG: EmailService loaded SenderEmail: '{_emailSettings.SenderEmail}'");
            Console.WriteLine($"DEBUG: EmailService loaded Username: '{_emailSettings.Username}'");

            if (string.IsNullOrEmpty(_emailSettings.SenderEmail))
            {
                throw new ArgumentNullException(nameof(_emailSettings.SenderEmail), "SenderEmail is not configured in EmailSettings.");
            }
            if (string.IsNullOrEmpty(_emailSettings.Username))
            {
                throw new ArgumentNullException(nameof(_emailSettings.Username), "Username is not configured in EmailSettings.");
            }
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            if (string.IsNullOrEmpty(_emailSettings.SenderEmail)) // Дополнительная проверка перед использованием
            {
                Console.Error.WriteLine("ОШИБКА КОНФИГУРАЦИИ: Email отправителя (SenderEmail) не задан.");
                // Можно выбросить исключение или просто не пытаться отправить
                throw new InvalidOperationException("SenderEmail is not configured. Cannot send email.");
            }
            if (string.IsNullOrEmpty(toEmail))
            {
                Console.Error.WriteLine($"ОШИБКА АДРЕСА ПОЛУЧАТЕЛЯ: Email получателя (toEmail) пуст или null. Тема: {subject}");
                throw new ArgumentNullException(nameof(toEmail), "Recipient email address (toEmail) cannot be null or empty.");
            }


            var mailMessage = new MailMessage
            {
                // Если _emailSettings.SenderEmail будет null или пуст, здесь будет ошибка
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
                client.UseDefaultCredentials = false; // ВАЖЛИВО!
                client.Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password);

                // Це дає більше логів:
                client.TargetName = "STARTTLS/smtp.gmail.com";

                await client.SendMailAsync(mailMessage);
            }
        }
    }
}