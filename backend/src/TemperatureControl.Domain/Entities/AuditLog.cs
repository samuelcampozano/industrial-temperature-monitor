namespace TemperatureControl.Domain.Entities;

/// <summary>
/// Registro de auditoría para trazabilidad
/// </summary>
public class AuditLog : BaseEntity
{
    public string EntityName { get; set; } = string.Empty; // Nombre de la entidad afectada
    public Guid EntityId { get; set; } // ID de la entidad afectada
    public string Action { get; set; } = string.Empty; // CREATE, UPDATE, DELETE, etc.
    public string? OldValues { get; set; } // JSON con valores anteriores
    public string? NewValues { get; set; } // JSON con valores nuevos
    public string IpAddress { get; set; } = string.Empty;
    public string? UserAgent { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
