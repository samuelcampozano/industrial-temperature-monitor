using TemperatureControl.Domain.Enums;

namespace TemperatureControl.Domain.Entities;

/// <summary>
/// Formulario de control de temperatura
/// </summary>
public class TemperatureControlForm : BaseEntity
{
    public string FormNumber { get; set; } = string.Empty; // Auto-generado: TEMP-YYYYMMDD-XXXX
    public string Destination { get; set; } = string.Empty; // Destino del producto
    public DateTime DefrostDate { get; set; } // Fecha de descongelación
    public DateTime ProductionDate { get; set; } // Fecha de producción
    public FormStatus Status { get; set; }

    // Firmas digitales (JSON con timestamp, nombre, y firma base64)
    public string? CreatedBySignature { get; set; }
    public string? ReviewedBySignature { get; set; }

    // Referencias a usuarios
    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public Guid? ReviewedByUserId { get; set; }
    public User? ReviewedByUser { get; set; }

    public DateTime? ReviewedAt { get; set; }
    public string? ReviewNotes { get; set; }

    // Información adicional
    public string? Observations { get; set; }
    public string? AttachmentUrls { get; set; } // JSON array de URLs de fotos/documentos
    public string? GeoLocation { get; set; } // JSON con lat/long

    // Navegación
    public ICollection<TemperatureRecord> TemperatureRecords { get; set; } = new List<TemperatureRecord>();
    public ICollection<TemperatureAlert> Alerts { get; set; } = new List<TemperatureAlert>();

    /// <summary>
    /// Verifica si el formulario puede ser editado
    /// </summary>
    public bool CanBeEdited()
    {
        return Status == FormStatus.Draft || Status == FormStatus.Rejected;
    }

    /// <summary>
    /// Verifica si el formulario puede ser revisado
    /// </summary>
    public bool CanBeReviewed()
    {
        return Status == FormStatus.Completed;
    }

    /// <summary>
    /// Genera el número de formulario
    /// </summary>
    public void GenerateFormNumber(int sequenceNumber)
    {
        var date = CreatedAt.ToString("yyyyMMdd");
        FormNumber = $"TEMP-{date}-{sequenceNumber:D4}";
    }
}
