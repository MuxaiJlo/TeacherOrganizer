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
            if (proposedStart >= proposedEnd)
                throw new InvalidOperationException("Proposed start time must be before end time.");

            if (proposedStart <= DateTime.UtcNow)
                throw new InvalidOperationException("Proposed start time must be in the future.");

            var lesson = await _context.Lessons
                .Include(l => l.Teacher)
                .Include(l => l.Students)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId);

            if (lesson == null) return null;

            var initiator = await _context.Users.FirstOrDefaultAsync(u => u.UserName == initiatorId);
            if (initiator == null) throw new UnauthorizedAccessException("Initiator not found");

            // Перевірка на конфлікт часу для вчителя
            bool teacherConflict = await _context.Lessons.AnyAsync(l =>
                l.Teacher.Id == lesson.Teacher.Id &&
                l.LessonId != lesson.LessonId &&
                l.StartTime < proposedEnd &&
                l.EndTime > proposedStart);

            if (teacherConflict)
                throw new InvalidOperationException("Teacher has another lesson at this time.");

            // Перевірка на конфлікт часу для студентів
            foreach (var student in lesson.Students)
            {
                bool studentConflict = await _context.Lessons.AnyAsync(l =>
                    l.Students.Any(s => s.Id == student.Id) &&
                    l.LessonId != lesson.LessonId &&
                    l.StartTime < proposedEnd &&
                    l.EndTime > proposedStart);

                if (studentConflict)
                    throw new InvalidOperationException($"Student {student.UserName} has another lesson at this time.");
            }

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

        public async Task<List<RescheduleRequestDto>> GetAllRequestsAsync()
        {
            var requests = await _context.RescheduleRequests
                .Include(r => r.Lesson).ThenInclude(l => l.Students)
                .Include(r => r.Lesson.Teacher)
                .Include(r => r.Initiator)
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
        public async Task<RescheduleRequestDto?> GetRequestByIdAsync(int requestId)
        {
            var request = await _context.RescheduleRequests
                .Include(r => r.Lesson).ThenInclude(l => l.Students)
                .Include(r => r.Lesson.Teacher)
                .Include(r => r.Initiator)
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (request == null)
                return null;

            return new RescheduleRequestDto
            {
                Id = request.Id,
                LessonId = request.LessonId,
                ProposedStartTime = request.ProposedStartTime,
                ProposedEndTime = request.ProposedEndTime,
                RequestStatus = request.RequestStatus,
                Initiator = new UserInfoDto
                {
                    UserName = request.Initiator.UserName,
                    Email = request.Initiator.Email,
                    FirstName = request.Initiator.FirstName,
                    LastName = request.Initiator.LastName
                },
                Lesson = new LessonInfoDto
                {
                    LessonId = request.Lesson.LessonId,
                    StartTime = request.Lesson.StartTime,
                    EndTime = request.Lesson.EndTime,
                    Description = request.Lesson.Description
                }
            };
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
                lesson.Status = LessonStatus.Scheduled; 
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
                    .ThenInclude(l => l.Students)
                .Include(r => r.Lesson.Teacher)
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (request == null) return false;

            // Якщо обидва часу передані, перевіряємо послідовність
            if (proposedStartTime.HasValue && proposedEndTime.HasValue)
            {
                if (proposedStartTime.Value >= proposedEndTime.Value)
                    throw new InvalidOperationException("Proposed start time must be before end time.");
            }

            // Якщо тільки початок переданий — перевіряємо, що він у майбутньому
            if (proposedStartTime.HasValue && proposedStartTime.Value <= DateTime.UtcNow)
                throw new InvalidOperationException("Proposed start time must be in the future.");

            if (proposedEndTime.HasValue && proposedEndTime.Value <= DateTime.UtcNow)
                throw new InvalidOperationException("Proposed end time must be in the future.");

            // Отримуємо нові часи або залишаємо старі
            var newStart = proposedStartTime ?? request.ProposedStartTime;
            var newEnd = proposedEndTime ?? request.ProposedEndTime;

            // Перевірка конфліктів для вчителя
            bool teacherConflict = await _context.Lessons.AnyAsync(l =>
                l.Teacher.Id == request.Lesson.Teacher.Id &&
                l.LessonId != request.Lesson.LessonId &&
                l.StartTime < newEnd &&
                l.EndTime > newStart);

            if (teacherConflict)
                throw new InvalidOperationException("Teacher has another lesson at this time.");

            // Перевірка конфліктів для студентів
            foreach (var student in request.Lesson.Students)
            {
                bool studentConflict = await _context.Lessons.AnyAsync(l =>
                    l.Students.Any(s => s.Id == student.Id) &&
                    l.LessonId != request.Lesson.LessonId &&
                    l.StartTime < newEnd &&
                    l.EndTime > newStart);

                if (studentConflict)
                    throw new InvalidOperationException($"Student {student.UserName} has another lesson at this time.");
            }

            // Оновлюємо дані
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
                if (newInitiator == null) return false;
                request.Initiator = newInitiator;
                request.InitiatorId = newInitiatorName;
            }

            request.RequestStatus = RescheduleRequestStatus.Pending;
            request.Lesson.Status = LessonStatus.RescheduledRequest;
            request.Lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

    }

}
