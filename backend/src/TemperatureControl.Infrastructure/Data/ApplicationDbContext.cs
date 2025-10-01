using Microsoft.EntityFrameworkCore;
using TemperatureControl.Domain.Entities;
using System.Reflection;

namespace TemperatureControl.Infrastructure.Data;

/// <summary>
/// Contexto principal de la base de datos
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<TemperatureControlForm> TemperatureForms => Set<TemperatureControlForm>();
    public DbSet<TemperatureRecord> TemperatureRecords => Set<TemperatureRecord>();
    public DbSet<TemperatureAlert> TemperatureAlerts => Set<TemperatureAlert>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar todas las configuraciones del ensamblado
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Filtro global para soft delete
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<TemperatureControlForm>().HasQueryFilter(f => !f.IsDeleted);
        modelBuilder.Entity<TemperatureRecord>().HasQueryFilter(r => !r.IsDeleted);
        modelBuilder.Entity<TemperatureAlert>().HasQueryFilter(a => !a.IsDeleted);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Actualizar timestamps automáticamente
        var entries = ChangeTracker.Entries<BaseEntity>();
        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedAt = DateTime.UtcNow;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
