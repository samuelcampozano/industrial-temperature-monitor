using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TemperatureControl.Domain.Entities;
using TemperatureControl.Domain.Enums;

namespace TemperatureControl.Infrastructure.Data;

/// <summary>
/// Semilla de datos para inicializar la base de datos
/// </summary>
public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            // Verificar si ya hay datos
            if (await _context.Users.AnyAsync())
            {
                _logger.LogInformation("La base de datos ya contiene datos. Saltando seed.");
                return;
            }

            _logger.LogInformation("Iniciando seed de base de datos...");

            await SeedUsersAsync();
            await SeedProductsAsync();
            await SeedTemperatureFormsAsync();

            await _context.SaveChangesAsync();

            _logger.LogInformation("Seed de base de datos completado exitosamente");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error durante el seed de base de datos");
            throw;
        }
    }

    private async Task SeedUsersAsync()
    {
        _logger.LogInformation("Creando usuarios de ejemplo...");

        var users = new List<User>
        {
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Administrador del Sistema",
                Email = "admin@temp.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePass123!"),
                Role = UserRole.Administrator,
                IsActive = true,
                Department = "TI",
                PhoneNumber = "+1234567890",
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Supervisor Principal",
                Email = "supervisor@temp.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePass123!"),
                Role = UserRole.Supervisor,
                IsActive = true,
                Department = "Calidad",
                PhoneNumber = "+1234567891",
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Operador de Planta",
                Email = "operador@temp.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePass123!"),
                Role = UserRole.Operator,
                IsActive = true,
                Department = "Producción",
                PhoneNumber = "+1234567892",
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Auditor de Calidad",
                Email = "auditor@temp.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Audit123!"),
                Role = UserRole.Auditor,
                IsActive = true,
                Department = "Auditoría",
                PhoneNumber = "+1234567893",
                CreatedAt = DateTime.UtcNow
            }
        };

        await _context.Users.AddRangeAsync(users);
        _logger.LogInformation("Creados {Count} usuarios de ejemplo", users.Count);
    }

    private async Task SeedProductsAsync()
    {
        _logger.LogInformation("Creando productos de ejemplo...");

        var products = new List<Product>
        {
            new Product
            {
                Id = Guid.NewGuid(),
                ProductCode = "160",
                ProductName = "Producto Congelado 160",
                MinTemperature = -25,
                MaxTemperature = -10,
                MaxDefrostTimeMinutes = 120,
                Description = "Producto premium para conservas de alta calidad",
                Category = "Congelados Premium",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                ProductCode = "101",
                ProductName = "Producto Congelado 101",
                MinTemperature = -25,
                MaxTemperature = -12,
                MaxDefrostTimeMinutes = 90,
                Description = "Producto estándar para conservas",
                Category = "Congelados Estándar",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                ProductCode = "IFK",
                ProductName = "IFK - Producto Especial Congelado",
                MinTemperature = -22,
                MaxTemperature = -10,
                MaxDefrostTimeMinutes = 100,
                Description = "Producto especial para línea IFK",
                Category = "Congelados Especiales",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                ProductCode = "IFG",
                ProductName = "IFG - Producto Gourmet Congelado",
                MinTemperature = -24,
                MaxTemperature = -11,
                MaxDefrostTimeMinutes = 110,
                Description = "Producto gourmet para línea IFG",
                Category = "Congelados Gourmet",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                ProductCode = "202",
                ProductName = "Producto Congelado 202",
                MinTemperature = -23,
                MaxTemperature = -13,
                MaxDefrostTimeMinutes = 95,
                Description = "Producto de línea secundaria",
                Category = "Congelados Estándar",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                ProductCode = "303",
                ProductName = "Producto Congelado 303",
                MinTemperature = -25,
                MaxTemperature = -15,
                MaxDefrostTimeMinutes = 85,
                Description = "Producto para exportación",
                Category = "Congelados Exportación",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await _context.Products.AddRangeAsync(products);
        _logger.LogInformation("Creados {Count} productos de ejemplo", products.Count);
    }

    private async Task SeedTemperatureFormsAsync()
    {
        _logger.LogInformation("Creando formularios de temperatura de ejemplo...");

        var users = await _context.Users.ToListAsync();
        var products = await _context.Products.ToListAsync();

        if (!users.Any() || !products.Any())
        {
            _logger.LogWarning("No hay usuarios o productos para crear formularios de ejemplo");
            return;
        }

        var operador = users.FirstOrDefault(u => u.Role == UserRole.Operator);
        var supervisor = users.FirstOrDefault(u => u.Role == UserRole.Supervisor);

        if (operador == null || supervisor == null)
        {
            _logger.LogWarning("No se encontraron operador o supervisor para crear formularios");
            return;
        }

        // Formulario 1 - Completado y Revisado
        var form1 = new TemperatureControlForm
        {
            Id = Guid.NewGuid(),
            FormNumber = $"TEMP-{DateTime.UtcNow:yyyyMMdd}-0001",
            Destination = "Planta de Conservas Central",
            DefrostDate = DateTime.UtcNow.AddDays(-2),
            ProductionDate = DateTime.UtcNow.AddDays(-1),
            Status = FormStatus.Reviewed,
            CreatedByUserId = operador.Id,
            ReviewedByUserId = supervisor.Id,
            ReviewedAt = DateTime.UtcNow.AddHours(-2),
            ReviewNotes = "Todo conforme, temperaturas dentro de rango",
            Observations = "Proceso normal sin incidencias",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddHours(-2)
        };

        var form1Records = new List<TemperatureRecord>
        {
            new TemperatureRecord
            {
                Id = Guid.NewGuid(),
                FormId = form1.Id,
                CarNumber = 1,
                ProductCode = products[0].ProductCode,
                ProductId = products[0].Id,
                DefrostStartTime = new TimeSpan(8, 0, 0),
                ProductTemperature = -18.5m,
                ConsumptionStartTime = new TimeSpan(10, 30, 0),
                ConsumptionEndTime = new TimeSpan(14, 0, 0),
                RecordOrder = 1,
                HasAlert = false,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new TemperatureRecord
            {
                Id = Guid.NewGuid(),
                FormId = form1.Id,
                CarNumber = 2,
                ProductCode = products[1].ProductCode,
                ProductId = products[1].Id,
                DefrostStartTime = new TimeSpan(8, 15, 0),
                ProductTemperature = -20.0m,
                ConsumptionStartTime = new TimeSpan(10, 45, 0),
                ConsumptionEndTime = new TimeSpan(14, 30, 0),
                RecordOrder = 2,
                HasAlert = false,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new TemperatureRecord
            {
                Id = Guid.NewGuid(),
                FormId = form1.Id,
                CarNumber = 3,
                ProductCode = products[2].ProductCode,
                ProductId = products[2].Id,
                DefrostStartTime = new TimeSpan(8, 30, 0),
                ProductTemperature = -16.8m,
                ConsumptionStartTime = new TimeSpan(11, 0, 0),
                ConsumptionEndTime = new TimeSpan(15, 0, 0),
                RecordOrder = 3,
                HasAlert = false,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new TemperatureRecord
            {
                Id = Guid.NewGuid(),
                FormId = form1.Id,
                CarNumber = 4,
                ProductCode = products[3].ProductCode,
                ProductId = products[3].Id,
                DefrostStartTime = new TimeSpan(8, 45, 0),
                ProductTemperature = -19.2m,
                ConsumptionStartTime = new TimeSpan(11, 15, 0),
                ConsumptionEndTime = new TimeSpan(15, 30, 0),
                RecordOrder = 4,
                HasAlert = false,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        // Formulario 2 - Completado, pendiente de revisión con alertas
        var form2 = new TemperatureControlForm
        {
            Id = Guid.NewGuid(),
            FormNumber = $"TEMP-{DateTime.UtcNow:yyyyMMdd}-0002",
            Destination = "Planta de Conservas Norte",
            DefrostDate = DateTime.UtcNow.AddDays(-1),
            ProductionDate = DateTime.UtcNow,
            Status = FormStatus.Completed,
            CreatedByUserId = operador.Id,
            Observations = "Se detectaron alertas de temperatura en coche 2",
            CreatedAt = DateTime.UtcNow.AddHours(-6),
            UpdatedAt = DateTime.UtcNow.AddHours(-3)
        };

        var form2Records = new List<TemperatureRecord>
        {
            new TemperatureRecord
            {
                Id = Guid.NewGuid(),
                FormId = form2.Id,
                CarNumber = 1,
                ProductCode = products[0].ProductCode,
                ProductId = products[0].Id,
                DefrostStartTime = new TimeSpan(7, 0, 0),
                ProductTemperature = -17.5m,
                ConsumptionStartTime = new TimeSpan(9, 30, 0),
                ConsumptionEndTime = new TimeSpan(13, 0, 0),
                RecordOrder = 1,
                HasAlert = false,
                CreatedAt = DateTime.UtcNow.AddHours(-6)
            },
            new TemperatureRecord
            {
                Id = Guid.NewGuid(),
                FormId = form2.Id,
                CarNumber = 2,
                ProductCode = products[1].ProductCode,
                ProductId = products[1].Id,
                DefrostStartTime = new TimeSpan(7, 15, 0),
                ProductTemperature = -9.5m, // Temperatura fuera de rango
                ConsumptionStartTime = new TimeSpan(9, 45, 0),
                ConsumptionEndTime = new TimeSpan(13, 30, 0),
                Observations = "Temperatura por encima del rango permitido",
                RecordOrder = 2,
                HasAlert = true,
                CreatedAt = DateTime.UtcNow.AddHours(-6)
            },
            new TemperatureRecord
            {
                Id = Guid.NewGuid(),
                FormId = form2.Id,
                CarNumber = 3,
                ProductCode = products[2].ProductCode,
                ProductId = products[2].Id,
                DefrostStartTime = new TimeSpan(7, 30, 0),
                ProductTemperature = -15.0m,
                ConsumptionStartTime = new TimeSpan(10, 0, 0),
                ConsumptionEndTime = new TimeSpan(14, 0, 0),
                RecordOrder = 3,
                HasAlert = false,
                CreatedAt = DateTime.UtcNow.AddHours(-6)
            }
        };

        var form2Alerts = new List<TemperatureAlert>
        {
            new TemperatureAlert
            {
                Id = Guid.NewGuid(),
                FormId = form2.Id,
                RecordId = form2Records[1].Id,
                Severity = AlertSeverity.Critical,
                Message = $"Temperatura crítica detectada: -9.5°C está fuera del rango permitido ({products[1].MinTemperature}°C a {products[1].MaxTemperature}°C) para producto {products[1].ProductCode}",
                IsResolved = false,
                CreatedAt = DateTime.UtcNow.AddHours(-6)
            }
        };

        // Formulario 3 - En borrador
        var form3 = new TemperatureControlForm
        {
            Id = Guid.NewGuid(),
            FormNumber = $"TEMP-{DateTime.UtcNow:yyyyMMdd}-0003",
            Destination = "Planta de Conservas Sur",
            DefrostDate = DateTime.UtcNow,
            ProductionDate = DateTime.UtcNow.AddDays(1),
            Status = FormStatus.Draft,
            CreatedByUserId = operador.Id,
            Observations = "Formulario en proceso de llenado",
            CreatedAt = DateTime.UtcNow.AddHours(-2)
        };

        var form3Records = new List<TemperatureRecord>
        {
            new TemperatureRecord
            {
                Id = Guid.NewGuid(),
                FormId = form3.Id,
                CarNumber = 1,
                ProductCode = products[4].ProductCode,
                ProductId = products[4].Id,
                DefrostStartTime = new TimeSpan(6, 0, 0),
                ProductTemperature = -21.0m,
                ConsumptionStartTime = new TimeSpan(8, 30, 0),
                RecordOrder = 1,
                HasAlert = false,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new TemperatureRecord
            {
                Id = Guid.NewGuid(),
                FormId = form3.Id,
                CarNumber = 2,
                ProductCode = products[5].ProductCode,
                ProductId = products[5].Id,
                DefrostStartTime = new TimeSpan(6, 15, 0),
                ProductTemperature = -22.5m,
                RecordOrder = 2,
                HasAlert = false,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            }
        };

        // Agregar todas las entidades
        await _context.TemperatureForms.AddRangeAsync(form1, form2, form3);
        await _context.TemperatureRecords.AddRangeAsync(form1Records);
        await _context.TemperatureRecords.AddRangeAsync(form2Records);
        await _context.TemperatureRecords.AddRangeAsync(form3Records);
        await _context.TemperatureAlerts.AddRangeAsync(form2Alerts);

        _logger.LogInformation("Creados 3 formularios de temperatura con registros y alertas de ejemplo");
    }
}
