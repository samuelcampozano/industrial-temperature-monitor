namespace TemperatureControl.Domain.Enums;

/// <summary>
/// Roles de usuario en el sistema
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Operador - Puede crear y editar formularios
    /// </summary>
    Operator = 0,

    /// <summary>
    /// Supervisor - Puede revisar y aprobar formularios
    /// </summary>
    Supervisor = 1,

    /// <summary>
    /// Administrador - Control total del sistema
    /// </summary>
    Administrator = 2,

    /// <summary>
    /// Auditor - Solo lectura para reportes y análisis
    /// </summary>
    Auditor = 3
}
