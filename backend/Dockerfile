# Stage 1: Development
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development
WORKDIR /src

# Copy solution and project files
COPY ["src/TemperatureControl.API/TemperatureControl.API.csproj", "src/TemperatureControl.API/"]
COPY ["src/TemperatureControl.Domain/TemperatureControl.Domain.csproj", "src/TemperatureControl.Domain/"]
COPY ["src/TemperatureControl.Infrastructure/TemperatureControl.Infrastructure.csproj", "src/TemperatureControl.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/TemperatureControl.API/TemperatureControl.API.csproj"

# Copy all source files
COPY . .

WORKDIR "/src/src/TemperatureControl.API"

EXPOSE 5000

CMD ["dotnet", "watch", "run", "--no-launch-profile"]

# Stage 2: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["src/TemperatureControl.API/TemperatureControl.API.csproj", "src/TemperatureControl.API/"]
COPY ["src/TemperatureControl.Domain/TemperatureControl.Domain.csproj", "src/TemperatureControl.Domain/"]
COPY ["src/TemperatureControl.Infrastructure/TemperatureControl.Infrastructure.csproj", "src/TemperatureControl.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/TemperatureControl.API/TemperatureControl.API.csproj"

# Copy all source files
COPY . .

# Build the application
WORKDIR "/src/src/TemperatureControl.API"
RUN dotnet build "TemperatureControl.API.csproj" -c Release -o /app/build

# Stage 3: Publish
FROM build AS publish
RUN dotnet publish "TemperatureControl.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install SQL Server tools for migrations (optional, only if needed)
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Copy published application
COPY --from=publish /app/publish .

# Expose port
EXPOSE 5000

# Environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Entry point with migration support
ENTRYPOINT ["dotnet", "TemperatureControl.API.dll"]
