using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Interfaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.RescheduleModels;

namespace TeacherOrganizer.Controllers.Reschedule
{
    [ApiController]
    [Route("api/[controller]")]
    public class RescheduleController : ControllerBase
    {
        private readonly IRescheduleService _rescheduleService;
        private readonly IEmailService _emailService;
        private readonly ILessonService _lessonService;

        public RescheduleController(IRescheduleService rescheduleService, IEmailService emailService, ILessonService lessonService)
        {
            _rescheduleService = rescheduleService;
            _emailService = emailService;
            _lessonService = lessonService;
        }
        // Post: /api/Reschedule/Propose
        [HttpPost("Propose")]
        [Authorize]
        public async Task<IActionResult> ProposeReschedule([FromBody] RescheduleProposalDto dto)
        {
            var userName = User.Identity?.Name;
            if (userName == null) return Unauthorized();

            var lesson = await _rescheduleService.ProposeRescheduleAsync(dto.LessonId, dto.ProposedStartTime, dto.ProposedEndTime, userName);
            if (lesson == null) return NotFound("Lesson not found");
            await _emailService.SendRescheduleProposedEmailAsync(lesson, userName, dto.ProposedStartTime, dto.ProposedEndTime);
            return Ok(new { success = true, message = "Reschedule proposed successfully" });
        }
        // Get: /api/Reschedule/Pending
        [HttpGet("Pending")]
        [Authorize]
        public async Task<IActionResult> GetPendingRequests()
        {
            var username = User.Identity?.Name;
            if (username == null) return Unauthorized();

            var result = await _rescheduleService.GetPendingRequestsForUserAsync(username);
            return Ok(result);
        }
        // POST /api/Reschedule/{id}/UpdateStatus
        [HttpPost("{id}/UpdateStatus")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateRescheduleStatusDto dto)
        {
            var username = User.Identity?.Name;
            if (username == null) return Unauthorized();

            var success = await _rescheduleService.UpdateRequestStatusAsync(id, dto.NewStatus, username);
            if (!success) return Forbid("Access denied or invalid request.");

            var lesson = await _lessonService.GetLessonByIdAsync(id);
            if (lesson != null)
            {
                await _emailService.SendRescheduleStatusUpdatedEmailAsync(lesson, dto.NewStatus.ToString(), username);
            }
                return Ok(new { success = true, message = "Status updated successfully" }); 
        }
        // DELETE /api/Reschedule/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            var username = User.Identity?.Name;
            if (username == null) return Unauthorized();

            var success = await _rescheduleService.DeleteRescheduleRequestAsync(id);
            if (!success) return NotFound("Reschedule request not found");
            var lesson = await _lessonService.GetLessonByIdAsync(id);
            if (lesson != null)
            {
                await _emailService.SendRescheduleDeletedEmailAsync(lesson, username);
            }
            return NoContent(); // 204 No Content, успешное удаление
        }
        // PUT /api/Reschedule/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateRequest(int id, [FromBody] UpdateRescheduleRequestDto dto)
        {
            var username = User.Identity?.Name;
            if (username == null) return Unauthorized();

            var success = await _rescheduleService.UpdateRescheduleRequestAsync(
                id,
                dto.ProposedStartTime,
                dto.ProposedEndTime,
                dto.NewInitiatorId
            );
            if (!success) return BadRequest("Failed to update reschedule request");
            var lesson = await _lessonService.GetLessonByIdAsync(id);
            if (lesson != null)
            {
                await _emailService.SendRescheduleUpdatedEmailAsync(lesson, username, dto.ProposedStartTime, dto.ProposedEndTime);
            }
            return Ok(new { success = true, message = "Reschedule request updated successfully" });
        }
    }

}
