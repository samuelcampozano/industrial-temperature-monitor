using Microsoft.EntityFrameworkCore;
using TemperatureControl.Domain.Entities;
using TemperatureControl.Infrastructure.Data;

namespace TemperatureControl.Infrastructure.Extensions;

/// <summary>
/// Extension methods for repository operations with EF Core
/// </summary>
public static class RepositoryExtensions
{
    /// <summary>
    /// Get forms with all related entities loaded
    /// </summary>
    public static async Task<IEnumerable<TemperatureControlForm>> GetFormsWithIncludesAsync(
        this ApplicationDbContext context,
        Func<IQueryable<TemperatureControlForm>, IQueryable<TemperatureControlForm>>? filter = null)
    {
        var query = context.TemperatureForms
            .Include(f => f.CreatedByUser)
            .Include(f => f.ReviewedByUser)
            .Include(f => f.TemperatureRecords)
                .ThenInclude(r => r.Product)
            .Include(f => f.Alerts)
            .AsQueryable();

        if (filter != null)
        {
            query = filter(query);
        }

        return await query.ToListAsync();
    }

    /// <summary>
    /// Get single form with all related entities loaded
    /// </summary>
    public static async Task<TemperatureControlForm?> GetFormWithIncludesAsync(
        this ApplicationDbContext context,
        Guid id)
    {
        return await context.TemperatureForms
            .Include(f => f.CreatedByUser)
            .Include(f => f.ReviewedByUser)
            .Include(f => f.TemperatureRecords)
                .ThenInclude(r => r.Product)
            .Include(f => f.Alerts)
            .FirstOrDefaultAsync(f => f.Id == id);
    }
}
