# Этап сборки
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем файл проекта и восстанавливаем зависимости
COPY ["TeacherOrganizer/TeacherOrganizer.csproj", "TeacherOrganizer/"]
RUN dotnet restore "TeacherOrganizer/TeacherOrganizer.csproj"

# Копируем весь код и собираем проект
COPY . .
WORKDIR "/src/TeacherOrganizer"
RUN dotnet build "TeacherOrganizer.csproj" -c Release -o /app/build

# Этап публикации
FROM build AS publish
RUN dotnet publish "TeacherOrganizer.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Финальный этап - runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Копируем опубликованные файлы
COPY --from=publish /app/publish .

# Настраиваем порт (Render использует переменную PORT)
ENV ASPNETCORE_URLS=http://+:$PORT

# Запускаем приложение
ENTRYPOINT ["dotnet", "TeacherOrganizer.dll"]