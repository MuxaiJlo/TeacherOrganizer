﻿using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.Json.Serialization;
using TeacherOrganizer.Controllers.Auth;
using TeacherOrganizer.Controllers.Feedback;
using TeacherOrganizer.Data;
using TeacherOrganizer.Interefaces;
using TeacherOrganizer.Interfaces;
using TeacherOrganizer.Models.ConfigurationModels;
using TeacherOrganizer.Models.DataModels;
using TeacherOrganizer.Services;
using TeacherOrganizer.Servies;
using static System.Formats.Asn1.AsnWriter;

namespace TeacherOrganizer
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews();

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add Identity and JWT Authentication
            builder.Services.AddIdentity<User, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

            builder.Services.AddScoped<AuthController>();
            builder.Services.AddScoped<FeedbackController>();
            builder.Services.AddScoped<AuthViewController>();
            builder.Services.AddScoped<ILessonService, LessonService>();
            builder.Services.AddScoped<IDictionaryService, DictionaryService>();
            builder.Services.AddScoped<IWordService, WordService>();
            builder.Services.AddScoped<IRescheduleService, RescheduleService>();
            builder.Services.AddScoped<ILessonDetailsService, LessonDetailsService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Cookies.ContainsKey("jwtToken"))
                        {
                            context.Token = context.Request.Cookies["jwtToken"];
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Open", builder =>
                    builder.AllowAnyOrigin()
                           .AllowAnyHeader()
                           .AllowAnyMethod());
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCors("Open");

            app.UseAuthentication();
            app.UseRouting();
            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            // Database initialization and seeding with proper error handling
            using (var scope = app.Services.CreateScope())
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

                try
                {
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    logger.LogInformation("🔄 Starting database initialization...");

                    // Проверяем подключение к базе данных
                    logger.LogInformation($"🔄 Testing database connection...");
                    var canConnect = await db.Database.CanConnectAsync();
                    logger.LogInformation($"Database connection status: {canConnect}");

                    if (!canConnect)
                    {
                        logger.LogError("❌ Cannot connect to database!");
                        throw new InvalidOperationException("Cannot connect to database");
                    }

                    // Применяем миграции
                    logger.LogInformation("🔄 Applying database migrations...");
                    var pendingMigrations = await db.Database.GetPendingMigrationsAsync();
                    logger.LogInformation($"Pending migrations count: {pendingMigrations.Count()}");

                    if (pendingMigrations.Any())
                    {
                        logger.LogInformation($"Applying migrations: {string.Join(", ", pendingMigrations)}");
                        await db.Database.MigrateAsync();
                        logger.LogInformation("✅ Database migrations applied successfully.");
                    }
                    else
                    {
                        logger.LogInformation("ℹ️ No pending migrations found.");
                    }

                    // Проверяем, что таблицы созданы
                    var tableExists = await db.Database.ExecuteSqlRawAsync("SELECT 1");
                    logger.LogInformation($"Database query test passed: {tableExists}");

                    // Seed roles and admin user
                    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
                    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

                    logger.LogInformation("🔄 Seeding roles...");
                    await SeedRolesAsync(roleManager, logger);

                    logger.LogInformation("🔄 Seeding admin user...");
                    await SeedAdminUserAsync(userManager, logger);

                    logger.LogInformation("✅ Database initialization completed successfully.");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "❌ An error occurred while initializing the database: {Message}", ex.Message);
                    logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);

                    // В production завершаем приложение если БД не инициализировалась
                    if (app.Environment.IsProduction())
                    {
                        logger.LogCritical("💀 Database initialization failed in production. Application will terminate.");
                        Environment.Exit(1); // Принудительное завершение с кодом ошибки
                    }
                    else
                    {
                        logger.LogWarning("⚠️ Database initialization failed in development. Application will continue.");
                    }
                }
            }
            using (var scope = app.Services.CreateScope())
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                logger?.LogInformation($"🚀 Starting application on port");
                await app.RunAsync();
            }
          
        }

        public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager, ILogger<Program> logger)
        {
            string[] roles = { "Teacher", "Student", "Admin" };

            foreach (var roleName in roles)
            {
                try
                {
                    if (!await roleManager.RoleExistsAsync(roleName))
                    {
                        var result = await roleManager.CreateAsync(new IdentityRole(roleName));
                        if (result.Succeeded)
                        {
                            logger.LogInformation($"✅ Role '{roleName}' created successfully.");
                        }
                        else
                        {
                            logger.LogWarning($"⚠️ Failed to create role '{roleName}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
                        }
                    }
                    else
                    {
                        logger.LogInformation($"ℹ️ Role '{roleName}' already exists.");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, $"❌ Error creating role '{roleName}': {ex.Message}");
                }
            }
        }

        public static async Task SeedAdminUserAsync(UserManager<User> userManager, ILogger<Program> logger)
        {
            string adminEmail = "mike.queen.jet@gmail.com";
            string adminPassword = "Admin_2345";

            try
            {
                var existingUser = await userManager.FindByEmailAsync(adminEmail);
                if (existingUser == null)
                {
                    var adminUser = new User
                    {
                        UserName = "admin",
                        Email = adminEmail,
                        EmailConfirmed = true,
                        FirstName = "System",
                        LastName = "Administrator",
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await userManager.CreateAsync(adminUser, adminPassword);

                    if (result.Succeeded)
                    {
                        var roleResult = await userManager.AddToRoleAsync(adminUser, "Admin");
                        if (roleResult.Succeeded)
                        {
                            logger.LogInformation("✅ Admin user created and assigned to Admin role successfully.");
                        }
                        else
                        {
                            logger.LogWarning($"⚠️ Admin user created but failed to assign role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                        }
                    }
                    else
                    {
                        logger.LogError($"❌ Failed to create admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
                else
                {
                    logger.LogInformation("ℹ️ Admin user already exists.");

                    // Убедимся, что админ имеет роль Admin
                    if (!await userManager.IsInRoleAsync(existingUser, "Admin"))
                    {
                        var roleResult = await userManager.AddToRoleAsync(existingUser, "Admin");
                        if (roleResult.Succeeded)
                        {
                            logger.LogInformation("✅ Admin role assigned to existing admin user.");
                        }
                        else
                        {
                            logger.LogWarning($"⚠️ Failed to assign Admin role to existing user: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "❌ Error during admin user seeding: {Message}", ex.Message);
            }
        }
    }
}