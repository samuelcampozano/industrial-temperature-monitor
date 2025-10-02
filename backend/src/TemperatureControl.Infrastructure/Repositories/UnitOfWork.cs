using Microsoft.EntityFrameworkCore.Storage;
using TemperatureControl.Domain.Entities;
using TemperatureControl.Domain.Interfaces;
using TemperatureControl.Infrastructure.Data;

namespace TemperatureControl.Infrastructure.Repositories;

/// <summary>
/// Implementación del Unit of Work
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Users = new Repository<User>(_context);
        Products = new Repository<Product>(_context);
        TemperatureForms = new Repository<TemperatureControlForm>(_context);
        TemperatureRecords = new Repository<TemperatureRecord>(_context);
        TemperatureAlerts = new Repository<TemperatureAlert>(_context);
        AuditLogs = new Repository<AuditLog>(_context);
    }

    public IRepository<User> Users { get; private set; }
    public IRepository<Product> Products { get; private set; }
    public IRepository<TemperatureControlForm> TemperatureForms { get; private set; }
    public IRepository<TemperatureRecord> TemperatureRecords { get; private set; }
    public IRepository<TemperatureAlert> TemperatureAlerts { get; private set; }
    public IRepository<AuditLog> AuditLogs { get; private set; }

    public object GetContext() => _context;

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
