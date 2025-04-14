using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Models.RescheduleModels;

namespace TeacherOrganizer.Servies
{
    public class RescheduleService : IRescheduleService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILessonService _lessonService;
        public RescheduleService(ApplicationDbContext context, ILessonService lessonService) 
        {
            _context = context;
            _lessonService = lessonService;
        }

        public async Task<Lesson?> ProposeRescheduleAsync(int lessonId, DateTime proposedStart, DateTime proposedEnd, string initiatorId)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Teacher)
                .Include(l => l.Students)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId);

            if (lesson == null) return null;

            var initiator = await _context.Users.FirstOrDefaultAsync(u => u.UserName == initiatorId);
            if (initiator == null) throw new UnauthorizedAccessException("Initiator not found");

            var rescheduleRequest = new RescheduleRequest
            {
                Lesson = lesson,
                Initiator = initiator,
                InitiatorId = initiatorId,
                ProposedStartTime = proposedStart,
                ProposedEndTime = proposedEnd,
                RequestStatus = RescheduleRequestStatus.Pending
            };

            _context.RescheduleRequests.Add(rescheduleRequest);

            lesson.Status = LessonStatus.RescheduledRequest;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return lesson;
        }

        public async Task<List<RescheduleRequestDto>> GetPendingRequestsForUserAsync(string userName)
        {
            var requests = await _context.RescheduleRequests
                .Include(r => r.Lesson).ThenInclude(l => l.Students)
                .Include(r => r.Lesson.Teacher)
                .Include(r => r.Initiator)
                .Where(r =>
                    r.RequestStatus == RescheduleRequestStatus.Pending &&
                    (r.Lesson.Teacher.UserName == userName || r.Lesson.Students.Any(s => s.UserName == userName))
                )
                .ToListAsync();

            return requests.Select(r => new RescheduleRequestDto
            {
                Id = r.Id,
                LessonId = r.LessonId,
                ProposedStartTime = r.ProposedStartTime,
                ProposedEndTime = r.ProposedEndTime,
                RequestStatus = r.RequestStatus,
                Initiator = new UserInfoDto
                {
                    UserName = r.Initiator.UserName,
                    Email = r.Initiator.Email,
                    FirstName = r.Initiator.FirstName,
                    LastName = r.Initiator.LastName
                },
                Lesson = new LessonInfoDto
                {
                    LessonId = r.Lesson.LessonId,
                    StartTime = r.Lesson.StartTime,
                    EndTime = r.Lesson.EndTime,
                    Description = r.Lesson.Description
                }
            }).ToList();
        }

        public async Task<bool> UpdateRequestStatusAsync(int requestId, RescheduleRequestStatus newStatus, string username)
        {
            var request = await _context.RescheduleRequests
                .Include(r => r.Lesson)
                .Include(r => r.Initiator)
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (request == null)
                return false;

            // Проверка, что пользователь имеет право изменять статус
            // (если пользователь не является инициатором запроса)
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (currentUser == null || request.InitiatorId == currentUser.Id)
                return false;

            // Если запрос одобрен, обновляем время урока
            if (newStatus == RescheduleRequestStatus.Approved)
            {
                // Обновляем урок
                var lesson = request.Lesson;
                lesson.StartTime = request.ProposedStartTime;
                lesson.EndTime = request.ProposedEndTime;
                lesson.UpdatedAt = DateTime.UtcNow;

                _context.Lessons.Update(lesson);
            }

            // Обновляем статус запроса
            request.RequestStatus = newStatus;
            _context.RescheduleRequests.Update(request);

            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteRescheduleRequestAsync(int requestId)
        {
            var request = await _context.RescheduleRequests.FindAsync(requestId);
            if (request == null) return false;

            _context.RescheduleRequests.Remove(request);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> UpdateRescheduleRequestAsync(int requestId, DateTime? proposedStartTime, DateTime? proposedEndTime, string newInitiatorName)
        {
            var request = await _context.RescheduleRequests
                .Include(r => r.Initiator)
                .Include(r => r.Lesson)
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (request == null) return false;

            if (proposedStartTime.HasValue)
            {
                request.ProposedStartTime = proposedStartTime.Value;
            }
            if (proposedEndTime.HasValue)
            {
                request.ProposedEndTime = proposedEndTime.Value;
            }
            if (newInitiatorName != null)
            {
                var newInitiator = await _context.Users.FirstOrDefaultAsync(u => u.UserName == newInitiatorName);
                if (newInitiator == null) return false; // Или можно выбросить исключение
                request.Initiator = newInitiator;
                request.InitiatorId = newInitiatorName;
            }

            request.RequestStatus = RescheduleRequestStatus.Pending; // При редактировании возвращаем статус в "Pending"
            request.Lesson.Status = LessonStatus.RescheduledRequest; // Обновляем статус урока
            request.Lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }

}
