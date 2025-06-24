using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlMessage);
        Task SendLessonCreatedEmailAsync(Lesson lesson, string teacherName);
        Task SendLessonUpdatedEmailAsync(Lesson lesson);
        Task SendLessonCanceledEmailAsync(Lesson lesson);
        Task SendLessonDeletedEmailAsync(Lesson lesson);
        Task SendRescheduleProposedEmailAsync(Lesson lesson, string initiatorName, DateTime proposedStart, DateTime proposedEnd);
        Task SendRescheduleStatusUpdatedEmailAsync(Lesson lesson, string status, string updatedBy);
        Task SendRescheduleDeletedEmailAsync(Lesson lesson, string deletedBy);
        Task SendRescheduleUpdatedEmailAsync(Lesson lesson, string updatedBy, DateTime? newStart, DateTime? newEnd);

    }
}