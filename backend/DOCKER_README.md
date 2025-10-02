# Temperature Control API - Docker Setup

## Overview

This document explains how to run the Temperature Control API using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose V2+
- At least 4GB of available RAM
- Ports 5000, 1433, and 6379 available

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Navigate to the backend directory
cd backend

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

The API will be available at: http://localhost:5000

### 2. Access Services

- **API**: http://localhost:5000
- **Swagger Documentation**: http://localhost:5000/swagger
- **Health Check**: http://localhost:5000/health
- **Hangfire Dashboard**: http://localhost:5000/hangfire
- **SQL Server**: localhost:1433
- **Redis**: localhost:6379

## Default Credentials

### API Users (seeded automatically in development)

| Email | Password | Role |
|-------|----------|------|
| admin@temp.com | SecurePass123! | Administrator |
| supervisor@temp.com | SecurePass123! | Supervisor |
| operador@temp.com | SecurePass123! | Operator |
| auditor@temp.com | Audit123! | Auditor |

### SQL Server

- **Username**: sa
- **Password**: YourStrong@Password123
- **Database**: TemperatureControlDB

## Docker Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d api
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View API logs only
docker-compose logs -f api

# View SQL Server logs
docker-compose logs -f sqlserver
```

### Rebuild Application

```bash
# Rebuild API image
docker-compose build api

# Rebuild and restart
docker-compose up -d --build api
```

### Execute Commands in Containers

```bash
# Access API container shell
docker exec -it temperaturecontrol-api bash

# Access SQL Server container
docker exec -it temperaturecontrol-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123"

# Access Redis CLI
docker exec -it temperaturecontrol-redis redis-cli
```

## Database Migrations

Migrations are automatically applied on application startup. The application will:

1. Connect to SQL Server
2. Apply pending migrations
3. Seed initial data (in Development mode)
4. Start accepting requests

### Manual Migration Commands

If you need to manage migrations manually:

```bash
# Install EF Core tools (if not already installed)
dotnet tool install --global dotnet-ef

# Create a new migration
dotnet ef migrations add MigrationName --project src/TemperatureControl.Infrastructure --startup-project src/TemperatureControl.API

# Update database manually
dotnet ef database update --project src/TemperatureControl.Infrastructure --startup-project src/TemperatureControl.API

# Remove last migration
dotnet ef migrations remove --project src/TemperatureControl.Infrastructure --startup-project src/TemperatureControl.API
```

## Environment Variables

You can customize the application by modifying environment variables in `docker-compose.yml`:

### Database Connection

```yaml
ConnectionStrings__DefaultConnection: "Server=sqlserver;Database=TemperatureControlDB;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;"
```

### JWT Configuration

```yaml
JWT__Secret: "YourSuperSecretKeyForJWTTokenGenerationMinimum32Characters"
JWT__Issuer: "TemperatureControlAPI"
JWT__Audience: "TemperatureControlClient"
JWT__ExpirationMinutes: "60"
```

### CORS Origins

```yaml
CORS__AllowedOrigins__0: "http://localhost:3000"
CORS__AllowedOrigins__1: "http://localhost:5173"
```

## Production Deployment

For production deployment, make the following changes:

### 1. Update docker-compose.yml

```yaml
api:
  environment:
    - ASPNETCORE_ENVIRONMENT=Production
    - ConnectionStrings__DefaultConnection=Server=your-production-server;Database=TemperatureControlDB;User Id=app_user;Password=SecurePassword;
```

### 2. Use Secrets for Sensitive Data

Don't hardcode passwords in docker-compose.yml. Use Docker secrets or environment files:

```bash
# Create a .env file (don't commit to git!)
echo "DB_PASSWORD=SecurePassword123" > .env
echo "JWT_SECRET=YourProductionSecretKey" >> .env
```

### 3. Enable HTTPS

Update the Dockerfile to expose port 443 and configure SSL certificates.

### 4. Disable Auto-Seeding

The database seeder only runs in Development mode by default. In Production, you'll need to create users manually or through a separate admin interface.

## Troubleshooting

### SQL Server won't start

- Ensure you have at least 2GB RAM available for SQL Server
- Check Docker Desktop resource limits
- View logs: `docker-compose logs sqlserver`

### API can't connect to database

- Wait for SQL Server health check to pass
- Check connection string in docker-compose.yml
- Verify network connectivity: `docker network inspect temperaturecontrol-network`

### Migrations fail

- Ensure SQL Server is fully started
- Check database credentials
- View detailed logs: `docker-compose logs -f api`

### Port already in use

If ports 5000, 1433, or 6379 are already in use, modify the port mappings in docker-compose.yml:

```yaml
ports:
  - "5001:5000"  # Change host port from 5000 to 5001
```

## Development Workflow

### Making Code Changes

1. Make your changes to the source code
2. Rebuild the API container: `docker-compose up -d --build api`
3. View logs to confirm changes: `docker-compose logs -f api`

### Database Changes

1. Create migration: `dotnet ef migrations add YourMigrationName`
2. Rebuild and restart: `docker-compose up -d --build api`
3. Migration will apply automatically on startup

## Data Persistence

Data is persisted in Docker volumes:

- **sqlserver-data**: SQL Server database files
- **redis-data**: Redis cache data

To backup data:

```bash
# Backup SQL Server database
docker exec temperaturecontrol-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -Q "BACKUP DATABASE TemperatureControlDB TO DISK = N'/var/opt/mssql/backup/TemperatureControlDB.bak'"

# Copy backup to host
docker cp temperaturecontrol-sqlserver:/var/opt/mssql/backup/TemperatureControlDB.bak ./backup/
```

## Sample Data

The application seeds sample data in Development mode:

- **4 Users**: Admin, Supervisor, Operator, Auditor
- **6 Products**: Codes 160, 101, IFK, IFG, 202, 303
- **3 Temperature Forms**: With various statuses and records

Use this data to test the application immediately after startup.

## API Testing

### Using Swagger

1. Navigate to http://localhost:5000/swagger
2. Click "Authorize" button
3. Login with: admin@temp.com / SecurePass123!
4. Copy the token from the response
5. Paste in the authorization dialog: `Bearer <your-token>`
6. Test endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@temp.com","password":"SecurePass123!"}'

# Get forms (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/temperatureforms \
  -H "Authorization: Bearer TOKEN"
```

## Support

For issues or questions:
- Check application logs: `docker-compose logs -f api`
- Review Swagger documentation: http://localhost:5000/swagger
- Check health endpoint: http://localhost:5000/health
