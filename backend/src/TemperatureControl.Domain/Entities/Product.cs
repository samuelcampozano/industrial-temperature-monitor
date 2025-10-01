namespace TemperatureControl.Domain.Entities;

/// <summary>
/// Producto del catálogo
/// </summary>
public class Product : BaseEntity
{
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal MinTemperature { get; set; } // Temperatura mínima permitida (°C)
    public decimal MaxTemperature { get; set; } // Temperatura máxima permitida (°C)
    public int MaxDefrostTimeMinutes { get; set; } // Tiempo máximo de descongelación (minutos)
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; }

    // Navegación
    public ICollection<TemperatureRecord> TemperatureRecords { get; set; } = new List<TemperatureRecord>();

    /// <summary>
    /// Valida si una temperatura está dentro del rango permitido
    /// </summary>
    public bool IsTemperatureInRange(decimal temperature)
    {
        return temperature >= MinTemperature && temperature <= MaxTemperature;
    }

    /// <summary>
    /// Obtiene la severidad de alerta según la temperatura
    /// </summary>
    public Enums.AlertSeverity GetAlertSeverity(decimal temperature)
    {
        if (temperature < MinTemperature - 5 || temperature > MaxTemperature + 5)
            return Enums.AlertSeverity.Emergency;

        if (temperature < MinTemperature || temperature > MaxTemperature)
            return Enums.AlertSeverity.Critical;

        var margin = (MaxTemperature - MinTemperature) * 0.1m;
        if (temperature < MinTemperature + margin || temperature > MaxTemperature - margin)
            return Enums.AlertSeverity.Warning;

        return Enums.AlertSeverity.Info;
    }
}
