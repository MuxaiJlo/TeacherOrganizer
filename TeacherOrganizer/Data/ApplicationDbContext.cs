using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeacherOrganizer.Models.DataModels;

namespace TeacherOrganizer.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Dictionary> Dictionaries { get; set; }
        public DbSet<Word> Words { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Lesson>()
                .HasOne(l => l.Teacher)
                .WithMany(u => u.TaughtLessons)
                .HasForeignKey(l => l.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Lesson>()
                .HasMany(l => l.Students)
                .WithMany(u => u.AttendedLessons);

            modelBuilder.Entity<Dictionary>()
                .HasOne(d => d.OriginalDictionary)
                .WithMany(d => d.CopiedDictionaries)
                .HasForeignKey(d => d.OriginalDictionaryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}