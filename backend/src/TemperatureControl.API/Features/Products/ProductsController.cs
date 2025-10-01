using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TemperatureControl.API.Common;
using TemperatureControl.Domain.Entities;
using TemperatureControl.Domain.Interfaces;

namespace TemperatureControl.API.Features.Products;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IUnitOfWork unitOfWork, ILogger<ProductsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Obtener todos los productos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetAll([FromQuery] bool? isActive = null)
    {
        try
        {
            var query = (await _unitOfWork.Products.GetAllAsync()).AsQueryable();

            if (isActive.HasValue)
            {
                query = query.Where(p => p.IsActive == isActive.Value);
            }

            var products = query
                .OrderBy(p => p.ProductCode)
                .Select(p => MapToDto(p))
                .ToList();

            return Ok(ApiResponse<List<ProductDto>>.SuccessResponse(products));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener productos");
            return StatusCode(500, ApiResponse<List<ProductDto>>.ErrorResponse("Error al obtener productos"));
        }
    }

    /// <summary>
    /// Obtener un producto por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(Guid id)
    {
        try
        {
            var product = await _unitOfWork.Products.GetByIdAsync(id);

            if (product == null)
            {
                return NotFound(ApiResponse<ProductDto>.ErrorResponse("Producto no encontrado"));
            }

            var dto = MapToDto(product);
            return Ok(ApiResponse<ProductDto>.SuccessResponse(dto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener producto {ProductId}", id);
            return StatusCode(500, ApiResponse<ProductDto>.ErrorResponse("Error al obtener producto"));
        }
    }

    /// <summary>
    /// Obtener un producto por código
    /// </summary>
    [HttpGet("code/{code}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetByCode(string code)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(ApiResponse<ProductDto>.ErrorResponse("El código del producto es requerido"));
            }

            var products = await _unitOfWork.Products.FindAsync(p => p.ProductCode == code);
            var product = products.FirstOrDefault();

            if (product == null)
            {
                return NotFound(ApiResponse<ProductDto>.ErrorResponse($"Producto con código '{code}' no encontrado"));
            }

            var dto = MapToDto(product);
            return Ok(ApiResponse<ProductDto>.SuccessResponse(dto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener producto por código {ProductCode}", code);
            return StatusCode(500, ApiResponse<ProductDto>.ErrorResponse("Error al obtener producto"));
        }
    }

    /// <summary>
    /// Crear un nuevo producto
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Create([FromBody] CreateProductRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<ProductDto>.ErrorResponse("Usuario no autenticado"));
            }

            // Validar request
            var validationErrors = ValidateProductRequest(request.ProductCode, request.ProductName,
                request.MinTemperature, request.MaxTemperature, request.MaxDefrostTimeMinutes);

            if (validationErrors.Any())
            {
                return BadRequest(ApiResponse<ProductDto>.ErrorResponse("Error de validación", validationErrors));
            }

            // Verificar si ya existe un producto con el mismo código
            var existingProducts = await _unitOfWork.Products.FindAsync(p => p.ProductCode == request.ProductCode);
            if (existingProducts.Any())
            {
                return BadRequest(ApiResponse<ProductDto>.ErrorResponse(
                    $"Ya existe un producto con el código '{request.ProductCode}'"));
            }

            var product = new Product
            {
                Id = Guid.NewGuid(),
                ProductCode = request.ProductCode.Trim().ToUpper(),
                ProductName = request.ProductName.Trim(),
                MinTemperature = request.MinTemperature,
                MaxTemperature = request.MaxTemperature,
                MaxDefrostTimeMinutes = request.MaxDefrostTimeMinutes,
                Description = request.Description?.Trim(),
                Category = request.Category?.Trim(),
                IsActive = true
            };

            await _unitOfWork.Products.AddAsync(product);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Producto {ProductCode} creado por usuario {UserId}", product.ProductCode, userId);

            var dto = MapToDto(product);
            return CreatedAtAction(nameof(GetById), new { id = product.Id },
                ApiResponse<ProductDto>.SuccessResponse(dto, "Producto creado exitosamente"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear producto");
            return StatusCode(500, ApiResponse<ProductDto>.ErrorResponse("Error al crear producto"));
        }
    }

    /// <summary>
    /// Actualizar un producto existente
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<ProductDto>.ErrorResponse("Usuario no autenticado"));
            }

            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(ApiResponse<ProductDto>.ErrorResponse("Producto no encontrado"));
            }

            // Validar request si se están actualizando los campos críticos
            var productCode = request.ProductCode ?? product.ProductCode;
            var productName = request.ProductName ?? product.ProductName;
            var minTemp = request.MinTemperature ?? product.MinTemperature;
            var maxTemp = request.MaxTemperature ?? product.MaxTemperature;
            var maxDefrost = request.MaxDefrostTimeMinutes ?? product.MaxDefrostTimeMinutes;

            var validationErrors = ValidateProductRequest(productCode, productName, minTemp, maxTemp, maxDefrost);
            if (validationErrors.Any())
            {
                return BadRequest(ApiResponse<ProductDto>.ErrorResponse("Error de validación", validationErrors));
            }

            // Verificar si el código ya existe en otro producto
            if (request.ProductCode != null && request.ProductCode != product.ProductCode)
            {
                var existingProducts = await _unitOfWork.Products.FindAsync(p =>
                    p.ProductCode == request.ProductCode && p.Id != id);
                if (existingProducts.Any())
                {
                    return BadRequest(ApiResponse<ProductDto>.ErrorResponse(
                        $"Ya existe otro producto con el código '{request.ProductCode}'"));
                }
                product.ProductCode = request.ProductCode.Trim().ToUpper();
            }

            // Actualizar campos
            if (request.ProductName != null)
            {
                product.ProductName = request.ProductName.Trim();
            }

            if (request.MinTemperature.HasValue)
            {
                product.MinTemperature = request.MinTemperature.Value;
            }

            if (request.MaxTemperature.HasValue)
            {
                product.MaxTemperature = request.MaxTemperature.Value;
            }

            if (request.MaxDefrostTimeMinutes.HasValue)
            {
                product.MaxDefrostTimeMinutes = request.MaxDefrostTimeMinutes.Value;
            }

            if (request.Description != null)
            {
                product.Description = request.Description.Trim();
            }

            if (request.Category != null)
            {
                product.Category = request.Category.Trim();
            }

            if (request.IsActive.HasValue)
            {
                product.IsActive = request.IsActive.Value;
            }

            await _unitOfWork.Products.UpdateAsync(product);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Producto {ProductCode} actualizado por usuario {UserId}", product.ProductCode, userId);

            var dto = MapToDto(product);
            return Ok(ApiResponse<ProductDto>.SuccessResponse(dto, "Producto actualizado exitosamente"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar producto {ProductId}", id);
            return StatusCode(500, ApiResponse<ProductDto>.ErrorResponse("Error al actualizar producto"));
        }
    }

    /// <summary>
    /// Eliminar un producto (soft delete)
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

            var product = await _unitOfWork.Products.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Producto no encontrado"));
            }

            // Verificar si el producto está siendo usado en registros de temperatura
            var records = await _unitOfWork.TemperatureRecords.FindAsync(r => r.ProductId == id);
            if (records.Any())
            {
                // En lugar de eliminar, marcar como inactivo
                product.IsActive = false;
                await _unitOfWork.Products.UpdateAsync(product);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Producto {ProductCode} desactivado por usuario {UserId} (tiene registros asociados)",
                    product.ProductCode, userId);

                return Ok(ApiResponse<object>.SuccessResponse(null,
                    "Producto desactivado exitosamente (tiene registros asociados)"));
            }

            await _unitOfWork.Products.DeleteAsync(product);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Producto {ProductCode} eliminado por usuario {UserId}", product.ProductCode, userId);

            return Ok(ApiResponse<object>.SuccessResponse(null, "Producto eliminado exitosamente"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar producto {ProductId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error al eliminar producto"));
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    private static List<string> ValidateProductRequest(string productCode, string productName,
        decimal minTemperature, decimal maxTemperature, int maxDefrostTimeMinutes)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(productCode))
        {
            errors.Add("El código del producto es requerido");
        }
        else if (productCode.Length > 20)
        {
            errors.Add("El código del producto no puede exceder 20 caracteres");
        }

        if (string.IsNullOrWhiteSpace(productName))
        {
            errors.Add("El nombre del producto es requerido");
        }
        else if (productName.Length > 200)
        {
            errors.Add("El nombre del producto no puede exceder 200 caracteres");
        }

        if (minTemperature >= maxTemperature)
        {
            errors.Add("La temperatura mínima debe ser menor que la temperatura máxima");
        }

        if (minTemperature < -100 || minTemperature > 100)
        {
            errors.Add("La temperatura mínima debe estar entre -100°C y 100°C");
        }

        if (maxTemperature < -100 || maxTemperature > 100)
        {
            errors.Add("La temperatura máxima debe estar entre -100°C y 100°C");
        }

        if (maxDefrostTimeMinutes <= 0)
        {
            errors.Add("El tiempo máximo de descongelación debe ser mayor a 0 minutos");
        }

        if (maxDefrostTimeMinutes > 1440) // 24 horas
        {
            errors.Add("El tiempo máximo de descongelación no puede exceder 1440 minutos (24 horas)");
        }

        return errors;
    }

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            ProductCode = product.ProductCode,
            ProductName = product.ProductName,
            MinTemperature = product.MinTemperature,
            MaxTemperature = product.MaxTemperature,
            MaxDefrostTimeMinutes = product.MaxDefrostTimeMinutes,
            Description = product.Description,
            Category = product.Category,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }
}

public record CreateProductRequest
{
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal MinTemperature { get; set; }
    public decimal MaxTemperature { get; set; }
    public int MaxDefrostTimeMinutes { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
}

public record UpdateProductRequest
{
    public string? ProductCode { get; set; }
    public string? ProductName { get; set; }
    public decimal? MinTemperature { get; set; }
    public decimal? MaxTemperature { get; set; }
    public int? MaxDefrostTimeMinutes { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool? IsActive { get; set; }
}

public class ProductDto
{
    public Guid Id { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal MinTemperature { get; set; }
    public decimal MaxTemperature { get; set; }
    public int MaxDefrostTimeMinutes { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
