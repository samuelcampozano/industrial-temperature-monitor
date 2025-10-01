using TemperatureControl.Domain.Entities;

namespace TemperatureControl.Domain.Interfaces;

/// <summary>
/// Patrón Unit of Work para transacciones
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Product> Products { get; }
    IRepository<TemperatureControlForm> TemperatureForms { get; }
    IRepository<TemperatureRecord> TemperatureRecords { get; }
    IRepository<TemperatureAlert> TemperatureAlerts { get; }
    IRepository<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
