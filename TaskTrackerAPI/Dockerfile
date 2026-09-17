# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY TaskTrackerAPI/TaskTrackerAPI.csproj TaskTrackerAPI/
RUN dotnet restore TaskTrackerAPI/TaskTrackerAPI.csproj

# Copy the rest and publish
COPY . .
WORKDIR /src/TaskTrackerAPI
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "TaskTrackerAPI.dll"]
