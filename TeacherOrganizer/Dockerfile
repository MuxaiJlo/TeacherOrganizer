# ���� ������
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# �������� ���� ������� � ��������������� �����������
COPY ["TeacherOrganizer/TeacherOrganizer.csproj", "TeacherOrganizer/"]
RUN dotnet restore "TeacherOrganizer/TeacherOrganizer.csproj"

# �������� ���� ��� � �������� ������
COPY . .
WORKDIR "/src/TeacherOrganizer"
RUN dotnet build "TeacherOrganizer.csproj" -c Release -o /app/build

# ���� ����������
FROM build AS publish
RUN dotnet publish "TeacherOrganizer.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ��������� ���� - runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# �������� �������������� �����
COPY --from=publish /app/publish .

# ����������� ���� (Render ���������� ���������� PORT)
ENV ASPNETCORE_URLS=http://+:$PORT

# ��������� ����������
ENTRYPOINT ["dotnet", "TeacherOrganizer.dll"]