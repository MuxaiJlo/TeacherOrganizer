using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
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
        public DbSet<RescheduleRequest> RescheduleRequests { get; set; }
        public DbSet<LessonDetail> LessonDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Конвертер для всех DateTime и DateTime?
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties()
                    .Where(p => p.ClrType == typeof(DateTime) || p.ClrType == typeof(DateTime?)))
                {
                    property.SetValueConverter(
                        new ValueConverter<DateTime, DateTime>(
                            v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
                            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                        )
                    );
                }
            }
            // Configure string properties for PostgreSQL
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.FirstName).HasMaxLength(100);
                entity.Property(e => e.LastName).HasMaxLength(100);
            });

            modelBuilder.Entity<Dictionary>(entity =>
            {
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.UserId).HasMaxLength(450);
            });

            modelBuilder.Entity<Word>(entity =>
            {
                entity.Property(e => e.Text).HasMaxLength(500).IsRequired();
                entity.Property(e => e.Translation).HasMaxLength(500);
                entity.Property(e => e.Example).HasMaxLength(1000);
            });

            modelBuilder.Entity<Lesson>(entity =>
            {
                entity.Property(e => e.TeacherId).HasMaxLength(450);
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.Status).HasConversion<string>();
            });

            modelBuilder.Entity<LessonDetail>(entity =>
            {
                entity.Property(e => e.Content).HasColumnType("text");
            });

            modelBuilder.Entity<RescheduleRequest>(entity =>
            {
                entity.Property(e => e.InitiatorId).HasMaxLength(450);
                entity.Property(e => e.RequestStatus).HasConversion<string>();
            });

            // Lesson relationships
            modelBuilder.Entity<Lesson>()
                .HasOne(l => l.Teacher)
                .WithMany(u => u.TaughtLessons)
                .HasForeignKey(l => l.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Lesson>()
                .HasMany(l => l.Students)
                .WithMany(u => u.AttendedLessons)
                .UsingEntity(j => j.ToTable("LessonStudents"));

            // RescheduleRequest relationships
            modelBuilder.Entity<RescheduleRequest>()
                .HasOne(r => r.Lesson)
                .WithMany()
                .HasForeignKey(r => r.LessonId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RescheduleRequest>()
                .HasOne(r => r.Initiator)
                .WithMany()
                .HasForeignKey(r => r.InitiatorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Dictionary relationships
            modelBuilder.Entity<Dictionary>()
                .HasOne(d => d.User)
                .WithMany(u => u.Dictionaries)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Dictionary>()
                .HasOne(d => d.OriginalDictionary)
                .WithMany(d => d.CopiedDictionaries)
                .HasForeignKey(d => d.OriginalDictionaryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Word relationships
            modelBuilder.Entity<Word>()
                .HasOne(w => w.Dictionary)
                .WithMany(d => d.Words)
                .HasForeignKey(w => w.DictionaryId)
                .OnDelete(DeleteBehavior.Cascade);

            // LessonDetail relationships
            modelBuilder.Entity<LessonDetail>()
                .HasOne(d => d.Lesson)
                .WithOne(l => l.Details)
                .HasForeignKey<LessonDetail>(d => d.LessonId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LessonDetail>()
                .HasMany(d => d.AccessibleUsers)
                .WithMany()
                .UsingEntity(j => j.ToTable("LessonDetailsUsers"));
        }
    }
}