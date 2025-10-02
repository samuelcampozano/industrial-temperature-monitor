# Temperature Control System - Backend API

## Overview

The Temperature Control System backend is a production-ready .NET 8 Web API for managing temperature control forms in food processing facilities. It provides comprehensive CRUD operations, real-time monitoring, PDF export, and robust reporting capabilities.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Temperature Forms Management**: Full CRUD operations with workflow (Draft → Completed → Reviewed/Rejected)
- **Product Catalog**: Manage products with temperature ranges and defrost time limits
- **Real-time Alerts**: Automatic temperature deviation detection
- **PDF Export**: Generate professional PDF reports using QuestPDF
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **Background Jobs**: Hangfire for scheduled tasks
- **Caching**: Redis integration for performance
- **Audit Logging**: Complete audit trail of all operations
- **Database Migrations**: EF Core migrations for version control

## Technology Stack

- **.NET 8.0**: Latest LTS version
- **ASP.NET Core Web API**: RESTful API framework
- **Entity Framework Core 8**: ORM with SQL Server support
- **SQL Server 2022**: Relational database
- **Redis**: Distributed caching
- **JWT Authentication**: Secure token-based auth
- **Hangfire**: Background job processing
- **Serilog**: Structured logging
- **AutoMapper**: Object-object mapping
- **FluentValidation**: Input validation
- **QuestPDF**: PDF generation
- **BCrypt.Net**: Password hashing
- **Swagger/OpenAPI**: API documentation

## Project Structure

```
backend/
├── src/
│   ├── TemperatureControl.API/          # Web API layer
│   │   ├── Features/
│   │   │   ├── Authentication/          # Auth controller
│   │   │   ├── TemperatureForms/        # Forms CRUD
│   │   │   ├── Products/                # Products CRUD
│   │   │   └── Reports/                 # Reporting & PDF export
│   │   ├── Common/                      # Shared API utilities
│   │   └── Program.cs                   # Application entry point
│   │
│   ├── TemperatureControl.Domain/       # Domain layer
│   │   ├── Entities/                    # Domain entities
│   │   ├── Enums/                       # Enumerations
│   │   └── Interfaces/                  # Repository interfaces
│   │
│   └── TemperatureControl.Infrastructure/  # Infrastructure layer
│       ├── Data/                        # DbContext & configurations
│       └── Repositories/                # Repository implementations
│
├── scripts/                             # Utility scripts
│   ├── init-db.sh                       # Linux/Mac database init
│   └── init-db.ps1                      # Windows database init
│
├── Dockerfile                           # Multi-stage Docker build
├── docker-compose.yml                   # Complete stack setup
├── .dockerignore                        # Docker ignore file
├── API_DOCUMENTATION.md                 # Complete API documentation
├── DOCKER_README.md                     # Docker setup guide
└── README.md                            # This file
```

## Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server 2022](https://www.microsoft.com/sql-server) or SQL Server LocalDB
- [Redis](https://redis.io/download) (optional for development)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for containerized setup)

### Option 1: Local Development (Without Docker)

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Update connection strings** in `src/TemperatureControl.API/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TemperatureControlDB;Trusted_Connection=True;",
       "Redis": "localhost:6379"
     }
   }
   ```

3. **Install EF Core tools**
   ```bash
   dotnet tool install --global dotnet-ef
   ```

4. **Run database initialization script**

   Windows (PowerShell):
   ```powershell
   .\scripts\init-db.ps1
   ```

   Linux/Mac:
   ```bash
   chmod +x scripts/init-db.sh
   ./scripts/init-db.sh
   ```

5. **Run the API**
   ```bash
   dotnet run --project src/TemperatureControl.API
   ```

6. **Access the API**
   - API: http://localhost:5000
   - Swagger: http://localhost:5000/swagger
   - Health Check: http://localhost:5000/health

### Option 2: Docker Setup (Recommended)

1. **Start the entire stack** (API + SQL Server + Redis)
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f api
   ```

3. **Access the API**
   - API: http://localhost:5000
   - Swagger: http://localhost:5000/swagger

For detailed Docker instructions, see [DOCKER_README.md](DOCKER_README.md)

## Default Users

After running the database seeder, these users are available:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@temp.com | SecurePass123! | Administrator | Full system access |
| supervisor@temp.com | SecurePass123! | Supervisor | Can review forms |
| operador@temp.com | SecurePass123! | Operator | Can create forms |
| auditor@temp.com | Audit123! | Auditor | Read-only access |

## Sample Data

The seeder creates:
- **6 Products**: Codes 160, 101, IFK, IFG, 202, 303 with temperature ranges -25°C to -10°C
- **3 Temperature Forms**:
  - Form 1: Reviewed and approved
  - Form 2: Completed with temperature alerts
  - Form 3: Draft in progress

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token

### Temperature Forms
- `GET /api/temperatureforms` - List all forms (with pagination and filters)
- `GET /api/temperatureforms/{id}` - Get form by ID
- `POST /api/temperatureforms` - Create new form
- `PUT /api/temperatureforms/{id}` - Update form
- `PATCH /api/temperatureforms/{id}/review` - Review/approve form
- `DELETE /api/temperatureforms/{id}` - Delete form

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/code/{code}` - Get product by code
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Reports
- `GET /api/reports/daily` - Daily report with statistics
- `GET /api/reports/statistics` - Dashboard analytics
- `GET /api/reports/export/{id}/pdf` - Export form to PDF

For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Database Migrations

### Create a new migration
```bash
dotnet ef migrations add MigrationName \
  --project src/TemperatureControl.Infrastructure \
  --startup-project src/TemperatureControl.API
```

### Apply migrations
```bash
dotnet ef database update \
  --project src/TemperatureControl.Infrastructure \
  --startup-project src/TemperatureControl.API
```

### Rollback migration
```bash
dotnet ef database update PreviousMigrationName \
  --project src/TemperatureControl.Infrastructure \
  --startup-project src/TemperatureControl.API
```

### Remove last migration
```bash
dotnet ef migrations remove \
  --project src/TemperatureControl.Infrastructure \
  --startup-project src/TemperatureControl.API
```

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TemperatureControlDB;User Id=sa;Password=YourPassword;",
    "Redis": "localhost:6379"
  },
  "JWT": {
    "Secret": "YourSuperSecretKeyMinimum32Characters",
    "Issuer": "TemperatureControlAPI",
    "Audience": "TemperatureControlClient",
    "ExpirationMinutes": "60"
  },
  "CORS": {
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:5173"]
  }
}
```

## Testing

### Using Swagger UI
1. Navigate to http://localhost:5000/swagger
2. Click "Authorize" button
3. Login using `/api/auth/login` endpoint
4. Copy the token from the response
5. Enter `Bearer <token>` in the authorization dialog
6. Test any endpoint

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@temp.com","password":"SecurePass123!"}'

# Get temperature forms
curl -X GET http://localhost:5000/api/temperatureforms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create a product
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "productCode": "505",
    "productName": "New Product",
    "minTemperature": -25,
    "maxTemperature": -10,
    "maxDefrostTimeMinutes": 120
  }'
```

## Logging

The API uses Serilog for structured logging:
- Console output in development
- File logging in `logs/` directory
- Log levels: Debug, Information, Warning, Error, Fatal

View logs:
```bash
# Real-time logs
dotnet run --project src/TemperatureControl.API

# Docker logs
docker-compose logs -f api

# Log files
cat logs/log-20240115.txt
```

## Background Jobs (Hangfire)

Access Hangfire Dashboard at: http://localhost:5000/hangfire

Default jobs:
- Database cleanup (daily)
- Alert notifications (real-time)
- Report generation (scheduled)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Granular access control
- **Password Hashing**: BCrypt with salt
- **SQL Injection Protection**: Parameterized queries via EF Core
- **CORS**: Configurable cross-origin resource sharing
- **HTTPS**: Production-ready SSL support
- **Rate Limiting**: Prevent abuse (to be configured)

## Performance Optimization

- **Redis Caching**: Distributed cache for frequently accessed data
- **Database Indexes**: Optimized queries
- **Async/Await**: Non-blocking I/O operations
- **Connection Pooling**: Efficient database connections
- **Pagination**: Large result sets

## Production Deployment

### Environment Variables
Set these environment variables in production:

```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection="YourProductionConnectionString"
JWT__Secret="YourProductionSecretKey"
```

### Database Backup
```bash
# Backup
docker exec temperaturecontrol-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "Password" \
  -Q "BACKUP DATABASE TemperatureControlDB TO DISK = N'/backup/db.bak'"

# Restore
docker exec temperaturecontrol-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "Password" \
  -Q "RESTORE DATABASE TemperatureControlDB FROM DISK = N'/backup/db.bak'"
```

### Health Checks
- Endpoint: `/health`
- Returns: `{"status": "healthy", "timestamp": "..."}`
- Use for load balancer health checks

## Troubleshooting

### Database Connection Issues
```bash
# Test SQL Server connection
docker exec -it temperaturecontrol-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Password123"
```

### Port Already in Use
```bash
# Find process using port 5000
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

### Migration Errors
```bash
# Drop and recreate database (WARNING: deletes all data)
dotnet ef database drop --force --project src/TemperatureControl.Infrastructure
dotnet ef database update --project src/TemperatureControl.Infrastructure
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests
4. Create a pull request

## License

Copyright (c) 2024 Temperature Control System. All rights reserved.

## Support

- API Documentation: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Docker Setup: [DOCKER_README.md](DOCKER_README.md)
- Swagger UI: http://localhost:5000/swagger
- Health Check: http://localhost:5000/health

---

**Version**: 1.0.0
**Last Updated**: January 2024
**Framework**: .NET 8.0
