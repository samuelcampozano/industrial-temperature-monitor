using TemperatureControl.Domain.Enums;

namespace TemperatureControl.Domain.Entities;

/// <summary>
/// Alerta de temperatura fuera de rango
/// </summary>
public class TemperatureAlert : BaseEntity
{
    public Guid FormId { get; set; }
    public TemperatureControlForm Form { get; set; } = null!;

    public Guid? RecordId { get; set; }
    public TemperatureRecord? Record { get; set; }

    public AlertSeverity Severity { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal Temperature { get; set; }
    public decimal ExpectedMinTemperature { get; set; }
    public decimal ExpectedMaxTemperature { get; set; }

    public bool IsAcknowledged { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public Guid? AcknowledgedByUserId { get; set; }
    public User? AcknowledgedByUser { get; set; }

    public bool EmailSent { get; set; }
    public bool SmsSent { get; set; }
}
