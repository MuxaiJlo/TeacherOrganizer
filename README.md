# 📚 TeacherOrganizer

A web application for organizing teaching workflow — manage lessons, students, schedules, vocabulary dictionaries, and reschedule requests all in one place.

> Developed by **Misha Nazarenko** · [GitHub](https://github.com/MuxaiJlo/TeacherOrganizer)

---

## ✨ Features

- **Lesson Management** — create, update, cancel, and auto-complete lessons with conflict detection
- **Reschedule Requests** — students or teachers can propose, approve, or reject reschedule proposals
- **Email Notifications** — automatic emails for lesson creation, updates, cancellations, and reschedule events
- **Vocabulary Dictionaries** — create personal dictionaries with words, translations, and examples; copy public dictionaries
- **Lesson Details** — attach rich content notes to lessons with per-user access control
- **User Management** — role-based system (Teacher / Student / Admin) with settings, password change, and paid lesson tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core (C#) |
| ORM | Entity Framework Core |
| Auth | ASP.NET Identity |
| Email | SMTP (Gmail) |
| Frontend | JavaScript, HTML, CSS |
| Container | Docker |
| License | AGPL-3.0 |

---

## 🚀 Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- SQL Server or compatible database
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MuxaiJlo/TeacherOrganizer.git
   cd TeacherOrganizer
   ```

2. **Configure settings** — update `appsettings.json` with your database connection string and email credentials:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "your_connection_string_here"
     },
     "EmailSettings": {
       "SenderEmail": "your_email@gmail.com",
       "SenderName": "TeacherOrganizer",
       "SmtpServer": "smtp.gmail.com",
       "SmtpPort": 587,
       "Username": "your_email@gmail.com",
       "Password": "your_app_password"
     }
   }
   ```

3. **Apply migrations**
   ```bash
   dotnet ef database update
   ```

4. **Run the application**
   ```bash
   dotnet run --project TeacherOrganizer
   ```

### Docker

```bash
docker build -t teacher-organizer .
docker run -p 8080:80 teacher-organizer
```

---

## 📂 Project Structure

```
TeacherOrganizer/
├── Controllers/          # API controllers
├── Data/                 # ApplicationDbContext
├── Interfaces/           # Service interfaces
├── Models/
│   ├── DataModels/       # Entity models (Lesson, User, Word, etc.)
│   ├── LessonModels/     # DTOs for lessons
│   ├── UserModels/       # DTOs for users
│   ├── DictionaryModels/ # DTOs for dictionaries
│   └── RescheduleModels/ # DTOs for reschedule requests
├── Services/
│   ├── LessonService.cs
│   ├── RescheduleService.cs
│   ├── UserService.cs
│   ├── DictionaryService.cs
│   ├── WordService.cs
│   ├── LessonDetailsService.cs
│   └── EmailService.cs
└── wwwroot/              # Frontend assets
```

---

## 🔑 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access: manage users, roles, all lessons |
| **Teacher** | Create & manage lessons, view all students, manage dictionaries |
| **Student** | View own lessons, propose reschedules, use dictionaries |

---

## 📧 Email Notifications

The system automatically sends email notifications for the following events:

- Lesson created, updated, canceled, or deleted
- Reschedule proposed, updated, approved/rejected, or deleted

All emails are sent to the relevant participants (students and teacher) of the lesson.

---

## ⚙️ Key Business Logic

- **Conflict detection** — prevents scheduling overlapping lessons for the same teacher or student
- **Auto-complete** — lessons are automatically marked as completed after their end time passes
- **Auto-delete** — canceled lessons older than 14 days are automatically removed
- **Paid lesson tracking** — student's paid lesson balance decreases when a lesson is auto-completed

---

## 📄 License

This project is licensed under the [AGPL-3.0 License](LICENSE.txt).

---

*Made with ❤️ by Misha Nazarenko*
