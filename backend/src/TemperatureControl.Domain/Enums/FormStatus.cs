namespace TemperatureControl.Domain.Enums;

/// <summary>
/// Estado del formulario de control de temperatura
/// </summary>
public enum FormStatus
{
    /// <summary>
    /// Borrador - En proceso de llenado
    /// </summary>
    Draft = 0,

    /// <summary>
    /// Completado - Listo para revisión
    /// </summary>
    Completed = 1,

    /// <summary>
    /// Revisado - Aprobado por supervisor
    /// </summary>
    Reviewed = 2,

    /// <summary>
    /// Rechazado - Requiere correcciones
    /// </summary>
    Rejected = 3,

    /// <summary>
    /// Archivado - Fuera de uso
    /// </summary>
    Archived = 4
}
