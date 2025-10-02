using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TemperatureControl.API.Common;
using TemperatureControl.Domain.Entities;
using TemperatureControl.Domain.Enums;
using TemperatureControl.Domain.Interfaces;
using TemperatureControl.Infrastructure.Data;

namespace TemperatureControl.API.Features.TemperatureForms;

[ApiController]
[Route("api/temperatureforms")]
[Authorize]
public class TemperatureFormsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TemperatureFormsController> _logger;

    public TemperatureFormsController(IUnitOfWork unitOfWork, ILogger<TemperatureFormsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Obtener todos los formularios con paginación y filtros
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResponse<TemperatureFormDto>>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] FormStatus? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? destination = null,
        [FromQuery] Guid? createdByUserId = null)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var context = (ApplicationDbContext)_unitOfWork.GetContext();
            var query = context.TemperatureForms
                .Include(f => f.CreatedByUser)
                .Include(f => f.ReviewedByUser)
                .Include(f => f.TemperatureRecords)
                    .ThenInclude(r => r.Product)
                .AsQueryable();

            // Aplicar filtros
            if (status.HasValue)
            {
                query = query.Where(f => f.Status == status.Value);
            }

            if (startDate.HasValue)
            {
                query = query.Where(f => f.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(f => f.CreatedAt <= endOfDay);
            }

            if (!string.IsNullOrWhiteSpace(destination))
            {
                query = query.Where(f => f.Destination.Contains(destination));
            }

            if (createdByUserId.HasValue)
            {
                query = query.Where(f => f.CreatedByUserId == createdByUserId.Value);
            }

            // Ordenar por fecha de creación descendente
            query = query.OrderByDescending(f => f.CreatedAt);

            var totalCount = query.Count();
            var items = query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => MapToDto(f))
                .ToList();

            var response = new PagedResponse<TemperatureFormDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(ApiResponse<PagedResponse<TemperatureFormDto>>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener formularios");
            return StatusCode(500, ApiResponse<PagedResponse<TemperatureFormDto>>.ErrorResponse("Error al obtener formularios"));
        }
    }

    /// <summary>
    /// Obtener un formulario por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TemperatureFormDto>>> GetById(Guid id)
    {
        try
        {
            var context = (ApplicationDbContext)_unitOfWork.GetContext();
            var form = await context.TemperatureForms
                .Include(f => f.CreatedByUser)
                .Include(f => f.ReviewedByUser)
                .Include(f => f.TemperatureRecords)
                    .ThenInclude(r => r.Product)
                .Include(f => f.Alerts)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (form == null)
            {
                return NotFound(ApiResponse<TemperatureFormDto>.ErrorResponse("Formulario no encontrado"));
            }

            var dto = MapToDto(form);
            return Ok(ApiResponse<TemperatureFormDto>.SuccessResponse(dto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener formulario {FormId}", id);
            return StatusCode(500, ApiResponse<TemperatureFormDto>.ErrorResponse("Error al obtener formulario"));
        }
    }

    /// <summary>
    /// Crear un nuevo formulario
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Operator,Supervisor,Administrator")]
    public async Task<ActionResult<ApiResponse<TemperatureFormDto>>> Create([FromBody] CreateTemperatureFormRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<TemperatureFormDto>.ErrorResponse("Usuario no autenticado"));
            }

            // Validar request
            if (string.IsNullOrWhiteSpace(request.Destination))
            {
                return BadRequest(ApiResponse<TemperatureFormDto>.ErrorResponse("El destino es requerido"));
            }

            if (request.DefrostDate == default)
            {
                return BadRequest(ApiResponse<TemperatureFormDto>.ErrorResponse("La fecha de descongelación es requerida"));
            }

            if (request.ProductionDate == default)
            {
                return BadRequest(ApiResponse<TemperatureFormDto>.ErrorResponse("La fecha de producción es requerida"));
            }

            // Generar número de formulario
            var today = DateTime.UtcNow.Date;
            var todayForms = (await _unitOfWork.TemperatureForms.FindAsync(f =>
                f.CreatedAt >= today && f.CreatedAt < today.AddDays(1))).Count();
            var sequenceNumber = todayForms + 1;

            var form = new TemperatureControlForm
            {
                Id = Guid.NewGuid(),
                Destination = request.Destination,
                DefrostDate = request.DefrostDate,
                ProductionDate = request.ProductionDate,
                Status = FormStatus.Draft,
                CreatedByUserId = userId,
                Observations = request.Observations,
                GeoLocation = request.GeoLocation
            };

            form.GenerateFormNumber(sequenceNumber);

            await _unitOfWork.TemperatureForms.AddAsync(form);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Formulario {FormNumber} creado por usuario {UserId}", form.FormNumber, userId);

            var context = (ApplicationDbContext)_unitOfWork.GetContext();
            var createdForm = await context.TemperatureForms
                .Include(f => f.CreatedByUser)
                .FirstOrDefaultAsync(f => f.Id == form.Id);

            var dto = MapToDto(createdForm!);
            return CreatedAtAction(nameof(GetById), new { id = form.Id },
                ApiResponse<TemperatureFormDto>.SuccessResponse(dto, "Formulario creado exitosamente"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear formulario");
            return StatusCode(500, ApiResponse<TemperatureFormDto>.ErrorResponse("Error al crear formulario"));
        }
    }

    /// <summary>
    /// Actualizar un formulario existente
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Operator,Supervisor,Administrator")]
    public async Task<ActionResult<ApiResponse<TemperatureFormDto>>> Update(Guid id, [FromBody] UpdateTemperatureFormRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<TemperatureFormDto>.ErrorResponse("Usuario no autenticado"));
            }

            var forms = await _unitOfWork.TemperatureForms.FindAsync(f => f.Id == id);
            var form = forms.FirstOrDefault();

            if (form == null)
            {
                return NotFound(ApiResponse<TemperatureFormDto>.ErrorResponse("Formulario no encontrado"));
            }

            // Validar que el formulario puede ser editado
            if (!form.CanBeEdited())
            {
                return BadRequest(ApiResponse<TemperatureFormDto>.ErrorResponse(
                    $"El formulario en estado {form.Status} no puede ser editado"));
            }

            // Validar que el usuario es el creador o un administrador
            var userRole = GetCurrentUserRole();
            if (form.CreatedByUserId != userId && userRole != "Administrator")
            {
                return Forbid();
            }

            // Actualizar campos
            if (!string.IsNullOrWhiteSpace(request.Destination))
            {
                form.Destination = request.Destination;
            }

            if (request.DefrostDate.HasValue)
            {
                form.DefrostDate = request.DefrostDate.Value;
            }

            if (request.ProductionDate.HasValue)
            {
                form.ProductionDate = request.ProductionDate.Value;
            }

            if (request.Status.HasValue)
            {
                form.Status = request.Status.Value;
            }

            if (request.Observations != null)
            {
                form.Observations = request.Observations;
            }

            if (request.CreatedBySignature != null)
            {
                form.CreatedBySignature = request.CreatedBySignature;
            }

            await _unitOfWork.TemperatureForms.UpdateAsync(form);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Formulario {FormNumber} actualizado por usuario {UserId}", form.FormNumber, userId);

            var context = (ApplicationDbContext)_unitOfWork.GetContext();
            var updatedForm = await context.TemperatureForms
                .Include(f => f.CreatedByUser)
                .Include(f => f.ReviewedByUser)
                .FirstOrDefaultAsync(f => f.Id == id);

            var dto = MapToDto(updatedForm!);
            return Ok(ApiResponse<TemperatureFormDto>.SuccessResponse(dto, "Formulario actualizado exitosamente"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar formulario {FormId}", id);
            return StatusCode(500, ApiResponse<TemperatureFormDto>.ErrorResponse("Error al actualizar formulario"));
        }
    }

    /// <summary>
    /// Revisar y aprobar/rechazar un formulario
    /// </summary>
    [HttpPatch("{id:guid}/review")]
    [Authorize(Roles = "Supervisor,Administrator")]
    public async Task<ActionResult<ApiResponse<TemperatureFormDto>>> Review(Guid id, [FromBody] ReviewFormRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<TemperatureFormDto>.ErrorResponse("Usuario no autenticado"));
            }

            var forms = await _unitOfWork.TemperatureForms.FindAsync(f => f.Id == id);
            var form = forms.FirstOrDefault();

            if (form == null)
            {
                return NotFound(ApiResponse<TemperatureFormDto>.ErrorResponse("Formulario no encontrado"));
            }

            // Validar que el formulario puede ser revisado
            if (!form.CanBeReviewed())
            {
                return BadRequest(ApiResponse<TemperatureFormDto>.ErrorResponse(
                    $"El formulario en estado {form.Status} no puede ser revisado"));
            }

            // Validar estado de revisión
            if (request.Status != FormStatus.Reviewed && request.Status != FormStatus.Rejected)
            {
                return BadRequest(ApiResponse<TemperatureFormDto>.ErrorResponse(
                    "El estado de revisión debe ser 'Reviewed' o 'Rejected'"));
            }

            // Actualizar formulario
            form.Status = request.Status;
            form.ReviewedByUserId = userId;
            form.ReviewedAt = DateTime.UtcNow;
            form.ReviewNotes = request.ReviewNotes;
            form.ReviewedBySignature = request.ReviewedBySignature;

            await _unitOfWork.TemperatureForms.UpdateAsync(form);
            await _unitOfWork.SaveChangesAsync();

            var statusText = request.Status == FormStatus.Reviewed ? "aprobado" : "rechazado";
            _logger.LogInformation("Formulario {FormNumber} {Status} por usuario {UserId}",
                form.FormNumber, statusText, userId);

            var context = (ApplicationDbContext)_unitOfWork.GetContext();
            var reviewedForm = await context.TemperatureForms
                .Include(f => f.CreatedByUser)
                .Include(f => f.ReviewedByUser)
                .Include(f => f.TemperatureRecords)
                    .ThenInclude(r => r.Product)
                .FirstOrDefaultAsync(f => f.Id == id);

            var dto = MapToDto(reviewedForm!);
            return Ok(ApiResponse<TemperatureFormDto>.SuccessResponse(dto, $"Formulario {statusText} exitosamente"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al revisar formulario {FormId}", id);
            return StatusCode(500, ApiResponse<TemperatureFormDto>.ErrorResponse("Error al revisar formulario"));
        }
    }

    /// <summary>
    /// Eliminar un formulario (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Usuario no autenticado"));
            }

            var forms = await _unitOfWork.TemperatureForms.FindAsync(f => f.Id == id);
            var form = forms.FirstOrDefault();

            if (form == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Formulario no encontrado"));
            }

            await _unitOfWork.TemperatureForms.DeleteAsync(form);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Formulario {FormNumber} eliminado por usuario {UserId}", form.FormNumber, userId);

            return Ok(ApiResponse<object>.SuccessResponse(null, "Formulario eliminado exitosamente"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar formulario {FormId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error al eliminar formulario"));
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    private string GetCurrentUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }

    private static TemperatureFormDto MapToDto(TemperatureControlForm form)
    {
        return new TemperatureFormDto
        {
            Id = form.Id,
            FormNumber = form.FormNumber,
            Destination = form.Destination,
            DefrostDate = form.DefrostDate,
            ProductionDate = form.ProductionDate,
            Status = form.Status.ToString(),
            CreatedBySignature = form.CreatedBySignature,
            ReviewedBySignature = form.ReviewedBySignature,
            CreatedByUserId = form.CreatedByUserId,
            CreatedByUserName = form.CreatedByUser?.Name ?? string.Empty,
            ReviewedByUserId = form.ReviewedByUserId,
            ReviewedByUserName = form.ReviewedByUser?.Name,
            ReviewedAt = form.ReviewedAt,
            ReviewNotes = form.ReviewNotes,
            Observations = form.Observations,
            AttachmentUrls = form.AttachmentUrls,
            GeoLocation = form.GeoLocation,
            CreatedAt = form.CreatedAt,
            UpdatedAt = form.UpdatedAt,
            TemperatureRecords = form.TemperatureRecords?.Select(r => new TemperatureRecordDto
            {
                Id = r.Id,
                FormId = r.FormId,
                CarNumber = r.CarNumber,
                ProductCode = r.ProductCode,
                ProductName = r.Product?.ProductName ?? string.Empty,
                DefrostStartTime = r.DefrostStartTime,
                ProductTemperature = r.ProductTemperature,
                ConsumptionStartTime = r.ConsumptionStartTime,
                ConsumptionEndTime = r.ConsumptionEndTime,
                Observations = r.Observations,
                RecordOrder = r.RecordOrder,
                HasAlert = r.HasAlert,
                DefrostDurationMinutes = r.GetDefrostDurationMinutes(),
                ConsumptionDurationMinutes = r.GetConsumptionDurationMinutes()
            }).OrderBy(r => r.RecordOrder).ToList() ?? new List<TemperatureRecordDto>(),
            AlertCount = form.Alerts?.Count ?? 0
        };
    }
}

public record CreateTemperatureFormRequest
{
    public string Destination { get; set; } = string.Empty;
    public DateTime DefrostDate { get; set; }
    public DateTime ProductionDate { get; set; }
    public string? Observations { get; set; }
    public string? GeoLocation { get; set; }
}

public record UpdateTemperatureFormRequest
{
    public string? Destination { get; set; }
    public DateTime? DefrostDate { get; set; }
    public DateTime? ProductionDate { get; set; }
    public FormStatus? Status { get; set; }
    public string? Observations { get; set; }
    public string? CreatedBySignature { get; set; }
}

public record ReviewFormRequest
{
    public FormStatus Status { get; set; }
    public string? ReviewNotes { get; set; }
    public string? ReviewedBySignature { get; set; }
}

public class TemperatureFormDto
{
    public Guid Id { get; set; }
    public string FormNumber { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DefrostDate { get; set; }
    public DateTime ProductionDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CreatedBySignature { get; set; }
    public string? ReviewedBySignature { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public Guid? ReviewedByUserId { get; set; }
    public string? ReviewedByUserName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewNotes { get; set; }
    public string? Observations { get; set; }
    public string? AttachmentUrls { get; set; }
    public string? GeoLocation { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<TemperatureRecordDto> TemperatureRecords { get; set; } = new();
    public int AlertCount { get; set; }
}

public class TemperatureRecordDto
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public int CarNumber { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public TimeSpan? DefrostStartTime { get; set; }
    public decimal ProductTemperature { get; set; }
    public TimeSpan? ConsumptionStartTime { get; set; }
    public TimeSpan? ConsumptionEndTime { get; set; }
    public string? Observations { get; set; }
    public int RecordOrder { get; set; }
    public bool HasAlert { get; set; }
    public int? DefrostDurationMinutes { get; set; }
    public int? ConsumptionDurationMinutes { get; set; }
}
