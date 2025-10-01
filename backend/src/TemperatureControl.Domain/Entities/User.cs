using TemperatureControl.Domain.Enums;

namespace TemperatureControl.Domain.Entities;

/// <summary>
/// Usuario del sistema
/// </summary>
public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Department { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Navegación
    public ICollection<TemperatureControlForm> CreatedForms { get; set; } = new List<TemperatureControlForm>();
    public ICollection<TemperatureControlForm> ReviewedForms { get; set; } = new List<TemperatureControlForm>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
