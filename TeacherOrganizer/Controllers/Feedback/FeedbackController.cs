using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Interfaces;
using TeacherOrganizer.Models.Feedback;
using TeacherOrganizer.Servies;

namespace TeacherOrganizer.Controllers.Feedback
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public FeedbackController(IEmailService emailService, IConfiguration configuration)
        {
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> PostFeedback([FromBody] FeedBackDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto?.Message))
                return BadRequest("Message is required.");

            var adminEmail = _configuration["Feedback:AdminEmail"];
            var subject = "New Feedback from TeacherOrganizer";

            // Get the username of the sender (if authenticated)
            var userName = User?.Identity?.IsAuthenticated == true ? User.Identity.Name : "Anonymous";

            var body = $@"
        <p><strong>From:</strong> {System.Net.WebUtility.HtmlEncode(userName)}</p>
        <p><strong>Feedback message:</strong></p>
        <p>{System.Net.WebUtility.HtmlEncode(dto.Message)}</p>";

            await _emailService.SendEmailAsync(adminEmail, subject, body);

            return Ok(new { success = true });
        }
    }
}