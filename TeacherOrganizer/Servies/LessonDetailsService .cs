using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Servies
{
    public class LessonDetailsService : ILessonDetailsService
    {
        private readonly ApplicationDbContext _context;

        public LessonDetailsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LessonDetail>> GetAllAccessibleForUserAsync(string userId)
        {
            return await _context.LessonDetails
                .Include(ld => ld.Lesson)
                .Include(ld => ld.AccessibleUsers)
                .Where(ld => ld.AccessibleUsers.Any(u => u.UserName == userId))
                .ToListAsync();
        }

        public async Task<LessonDetail> GetByIdAsync(int id)
        {
            return await _context.LessonDetails
                .Include(ld => ld.Lesson)
                .Include(ld => ld.AccessibleUsers)
                .FirstOrDefaultAsync(ld => ld.LessonDetailsId == id);
        }

        public async Task<bool> HasUserAccessAsync(int lessonDetailsId, string userId)
        {
            var lessonDetails = await _context.LessonDetails
                .Include(ld => ld.AccessibleUsers)
                .FirstOrDefaultAsync(ld => ld.LessonDetailsId == lessonDetailsId);

            if (lessonDetails == null)
                return false;

            return lessonDetails.AccessibleUsers.Any(u => u.UserName == userId);
        }

        public async Task<LessonDetail> CreateAsync(LessonDetail lessonDetails, List<string> accessibleUserIds)
        {
            lessonDetails.CreatedAt = DateTime.UtcNow;
            lessonDetails.UpdatedAt = DateTime.UtcNow;

            _context.LessonDetails.Add(lessonDetails);
            await _context.SaveChangesAsync();

            // Додаємо користувачів з доступом
            if (accessibleUserIds != null && accessibleUserIds.Any())
            {
                await UpdateAccessibleUsersAsync(lessonDetails.LessonDetailsId, accessibleUserIds);
            }

            return lessonDetails;
        }

        public async Task<LessonDetail> UpdateAsync(LessonDetail lessonDetails)
        {
            var existingDetails = await _context.LessonDetails.FindAsync(lessonDetails.LessonDetailsId);

            if (existingDetails == null)
                return null;

            existingDetails.Content = lessonDetails.Content;
            existingDetails.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return existingDetails;
        }

        public async Task UpdateAccessibleUsersAsync(int lessonDetailsId, List<string> userIds)
        {
            var lessonDetails = await _context.LessonDetails
                .Include(ld => ld.AccessibleUsers)
                .FirstOrDefaultAsync(ld => ld.LessonDetailsId == lessonDetailsId);

            if (lessonDetails == null)
                throw new KeyNotFoundException($"LessonDetails with ID {lessonDetailsId} not found");

            // Видаляємо всіх поточних користувачів
            lessonDetails.AccessibleUsers.Clear();

            // Додаємо нових користувачів
            if (userIds != null && userIds.Any())
            {
                var users = await _context.Users
                    .Where(u => userIds.Contains(u.UserName))
                    .ToListAsync();

                foreach (var user in users)
                {
                    lessonDetails.AccessibleUsers.Add(user);
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var lessonDetails = await _context.LessonDetails.FindAsync(id);

            if (lessonDetails == null)
                return false;

            _context.LessonDetails.Remove(lessonDetails);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task AddUserAccessAsync(int lessonDetailsId, string userId)
        {
            var lessonDetails = await _context.LessonDetails
                .Include(ld => ld.AccessibleUsers)
                .FirstOrDefaultAsync(ld => ld.LessonDetailsId == lessonDetailsId);

            if (lessonDetails == null)
                throw new KeyNotFoundException($"LessonDetails with ID {lessonDetailsId} not found");

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                throw new KeyNotFoundException($"User with ID {userId} not found");

            if (!lessonDetails.AccessibleUsers.Any(u => u.UserName == userId))
            {
                lessonDetails.AccessibleUsers.Add(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task RemoveUserAccessAsync(int lessonDetailsId, string userId)
        {
            var lessonDetails = await _context.LessonDetails
                .Include(ld => ld.AccessibleUsers)
                .FirstOrDefaultAsync(ld => ld.LessonDetailsId == lessonDetailsId);

            if (lessonDetails == null)
                throw new KeyNotFoundException($"LessonDetails with ID {lessonDetailsId} not found");

            var user = lessonDetails.AccessibleUsers.FirstOrDefault(u => u.UserName == userId);

            if (user != null)
            {
                lessonDetails.AccessibleUsers.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}
