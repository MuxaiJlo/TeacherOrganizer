using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.RescheduleModels;

namespace TeacherOrganizer.Interefaces
{
    public interface IRescheduleService
    {
        Task<Lesson?> ProposeRescheduleAsync(int lessonId, DateTime proposedStart, DateTime proposedEnd, string initiatorId);
        Task<List<RescheduleRequestDto>> GetPendingRequestsForUserAsync(string userName);
        Task<bool> UpdateRequestStatusAsync(int requestId, RescheduleRequestStatus newStatus, string username);
        Task<bool> DeleteRescheduleRequestAsync(int requestId);
        Task<List<RescheduleRequestDto>> GetAllRequestsAsync();
        Task<RescheduleRequestDto?> GetRequestByIdAsync(int requestId);
        Task<bool> UpdateRescheduleRequestAsync(int requestId, DateTime? proposedStartTime, DateTime? proposedEndTime, string newInitiatorName);
    }

}
