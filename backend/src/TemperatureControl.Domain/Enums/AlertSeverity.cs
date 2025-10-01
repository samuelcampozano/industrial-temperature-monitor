namespace TemperatureControl.Domain.Enums;

/// <summary>
/// Severidad de alertas de temperatura
/// </summary>
public enum AlertSeverity
{
    /// <summary>
    /// Información - Temperatura dentro de rango aceptable
    /// </summary>
    Info = 0,

    /// <summary>
    /// Advertencia - Temperatura cerca del límite
    /// </summary>
    Warning = 1,

    /// <summary>
    /// Crítico - Temperatura fuera de rango permitido
    /// </summary>
    Critical = 2,

    /// <summary>
    /// Emergencia - Requiere acción inmediata
    /// </summary>
    Emergency = 3
}
