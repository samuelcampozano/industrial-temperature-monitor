namespace TemperatureControl.Domain.Entities;

/// <summary>
/// Registro individual de temperatura por coche/producto
/// </summary>
public class TemperatureRecord : BaseEntity
{
    public Guid FormId { get; set; }
    public TemperatureControlForm Form { get; set; } = null!;

    public int CarNumber { get; set; } // Número de coche
    public string ProductCode { get; set; } = string.Empty;

    public Guid? ProductId { get; set; }
    public Product? Product { get; set; }

    public TimeSpan? DefrostStartTime { get; set; } // Hora inicio descongelación
    public decimal ProductTemperature { get; set; } // Temperatura del producto (°C)
    public TimeSpan? ConsumptionStartTime { get; set; } // Hora inicio consumo
    public TimeSpan? ConsumptionEndTime { get; set; } // Hora fin consumo

    public string? Observations { get; set; } // Observaciones específicas del registro
    public int RecordOrder { get; set; } // Orden del registro en el formulario

    public bool HasAlert { get; set; } // Indica si generó alerta de temperatura

    /// <summary>
    /// Calcula la duración del descongelamiento en minutos
    /// </summary>
    public int? GetDefrostDurationMinutes()
    {
        if (!DefrostStartTime.HasValue || !ConsumptionStartTime.HasValue)
            return null;

        var duration = ConsumptionStartTime.Value - DefrostStartTime.Value;
        return (int)duration.TotalMinutes;
    }

    /// <summary>
    /// Calcula la duración del consumo en minutos
    /// </summary>
    public int? GetConsumptionDurationMinutes()
    {
        if (!ConsumptionStartTime.HasValue || !ConsumptionEndTime.HasValue)
            return null;

        var duration = ConsumptionEndTime.Value - ConsumptionStartTime.Value;
        return (int)duration.TotalMinutes;
    }

    /// <summary>
    /// Valida si la temperatura está dentro del rango del producto
    /// </summary>
    public bool ValidateTemperature()
    {
        if (Product == null)
            return true; // No se puede validar sin producto

        return Product.IsTemperatureInRange(ProductTemperature);
    }
}
