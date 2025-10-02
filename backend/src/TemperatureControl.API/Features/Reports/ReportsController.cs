using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TemperatureControl.API.Common;
using TemperatureControl.Domain.Entities;
using TemperatureControl.Domain.Enums;
using TemperatureControl.Domain.Interfaces;
using TemperatureControl.Infrastructure.Data;

namespace TemperatureControl.API.Features.Reports;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IUnitOfWork unitOfWork, ILogger<ReportsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Obtener reporte diario de formularios
    /// </summary>
    [HttpGet("daily")]
    public async Task<ActionResult<ApiResponse<DailyReportDto>>> GetDailyReport([FromQuery] DateTime? date = null)
    {
        try
        {
            var targetDate = date ?? DateTime.UtcNow.Date;
            var startOfDay = targetDate.Date;
            var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

            var context = (ApplicationDbContext)_unitOfWork.GetContext();
            var forms = await context.TemperatureForms
                .Include(f => f.CreatedByUser)
                .Include(f => f.ReviewedByUser)
                .Include(f => f.TemperatureRecords)
                    .ThenInclude(r => r.Product)
                .Include(f => f.Alerts)
                .Where(f => f.CreatedAt >= startOfDay && f.CreatedAt <= endOfDay)
                .ToListAsync();

            var totalForms = forms.Count;
            var draftForms = forms.Count(f => f.Status == FormStatus.Draft);
            var completedForms = forms.Count(f => f.Status == FormStatus.Completed);
            var reviewedForms = forms.Count(f => f.Status == FormStatus.Reviewed);
            var rejectedForms = forms.Count(f => f.Status == FormStatus.Rejected);

            var totalRecords = forms.Sum(f => f.TemperatureRecords.Count);
            var recordsWithAlerts = forms.Sum(f => f.TemperatureRecords.Count(r => r.HasAlert));
            var totalAlerts = forms.Sum(f => f.Alerts.Count);

            var criticalAlerts = forms.Sum(f => f.Alerts.Count(a => a.Severity == AlertSeverity.Critical));
            var emergencyAlerts = forms.Sum(f => f.Alerts.Count(a => a.Severity == AlertSeverity.Emergency));

            var formsByUser = forms
                .GroupBy(f => new { f.CreatedByUserId, f.CreatedByUser.Name })
                .Select(g => new UserFormSummary
                {
                    UserId = g.Key.CreatedByUserId,
                    UserName = g.Key.Name,
                    TotalForms = g.Count(),
                    DraftForms = g.Count(f => f.Status == FormStatus.Draft),
                    CompletedForms = g.Count(f => f.Status == FormStatus.Completed),
                    ReviewedForms = g.Count(f => f.Status == FormStatus.Reviewed),
                    RejectedForms = g.Count(f => f.Status == FormStatus.Rejected)
                })
                .OrderByDescending(u => u.TotalForms)
                .ToList();

            var productUsage = forms
                .SelectMany(f => f.TemperatureRecords)
                .Where(r => r.Product != null)
                .GroupBy(r => new { r.ProductCode, r.Product!.ProductName })
                .Select(g => new ProductUsageSummary
                {
                    ProductCode = g.Key.ProductCode,
                    ProductName = g.Key.ProductName,
                    TotalRecords = g.Count(),
                    RecordsWithAlerts = g.Count(r => r.HasAlert),
                    AverageTemperature = g.Average(r => r.ProductTemperature),
                    MinTemperature = g.Min(r => r.ProductTemperature),
                    MaxTemperature = g.Max(r => r.ProductTemperature)
                })
                .OrderByDescending(p => p.TotalRecords)
                .ToList();

            var report = new DailyReportDto
            {
                Date = targetDate,
                TotalForms = totalForms,
                DraftForms = draftForms,
                CompletedForms = completedForms,
                ReviewedForms = reviewedForms,
                RejectedForms = rejectedForms,
                TotalRecords = totalRecords,
                RecordsWithAlerts = recordsWithAlerts,
                TotalAlerts = totalAlerts,
                CriticalAlerts = criticalAlerts,
                EmergencyAlerts = emergencyAlerts,
                FormsByUser = formsByUser,
                ProductUsage = productUsage,
                GeneratedAt = DateTime.UtcNow
            };

            return Ok(ApiResponse<DailyReportDto>.SuccessResponse(report));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar reporte diario");
            return StatusCode(500, ApiResponse<DailyReportDto>.ErrorResponse("Error al generar reporte diario"));
        }
    }

    /// <summary>
    /// Obtener estadísticas del dashboard
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<DashboardStatisticsDto>>> GetStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30).Date;
            var end = endDate ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

            var context = (ApplicationDbContext)_unitOfWork.GetContext();
            var forms = await context.TemperatureForms
                .Include(f => f.TemperatureRecords)
                .Include(f => f.Alerts)
                .Where(f => f.CreatedAt >= start && f.CreatedAt <= end)
                .ToListAsync();

            var totalForms = forms.Count;
            var pendingReview = forms.Count(f => f.Status == FormStatus.Completed);
            var totalRecords = forms.Sum(f => f.TemperatureRecords.Count);
            var totalAlerts = forms.Sum(f => f.Alerts.Count);

            var averageRecordsPerForm = totalForms > 0 ? (decimal)totalRecords / totalForms : 0;
            var formsWithAlerts = forms.Count(f => f.Alerts.Any());
            var alertRate = totalForms > 0 ? (decimal)formsWithAlerts / totalForms * 100 : 0;

            var criticalAlerts = forms.Sum(f => f.Alerts.Count(a =>
                a.Severity == AlertSeverity.Critical || a.Severity == AlertSeverity.Emergency));

            var formsByStatus = forms
                .GroupBy(f => f.Status)
                .Select(g => new StatusCount
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToList();

            var formsByDay = forms
                .GroupBy(f => f.CreatedAt.Date)
                .Select(g => new DailyCount
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            var alertsByDay = forms
                .Where(f => f.Alerts.Any())
                .SelectMany(f => f.Alerts.Select(a => new { a.CreatedAt.Date, Alert = a }))
                .GroupBy(x => x.Date)
                .Select(g => new DailyCount
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            var topProducts = forms
                .SelectMany(f => f.TemperatureRecords)
                .Where(r => !string.IsNullOrEmpty(r.ProductCode))
                .GroupBy(r => r.ProductCode)
                .Select(g => new ProductCount
                {
                    ProductCode = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(p => p.Count)
                .Take(10)
                .ToList();

            var statistics = new DashboardStatisticsDto
            {
                TotalForms = totalForms,
                PendingReview = pendingReview,
                TotalRecords = totalRecords,
                TotalAlerts = totalAlerts,
                CriticalAlerts = criticalAlerts,
                AverageRecordsPerForm = Math.Round(averageRecordsPerForm, 2),
                AlertRate = Math.Round(alertRate, 2),
                FormsByStatus = formsByStatus,
                FormsByDay = formsByDay,
                AlertsByDay = alertsByDay,
                TopProducts = topProducts,
                DateRange = new DateRange
                {
                    StartDate = start,
                    EndDate = end
                }
            };

            return Ok(ApiResponse<DashboardStatisticsDto>.SuccessResponse(statistics));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener estadísticas");
            return StatusCode(500, ApiResponse<DashboardStatisticsDto>.ErrorResponse("Error al obtener estadísticas"));
        }
    }

    /// <summary>
    /// Exportar formulario a PDF
    /// </summary>
    [HttpGet("export/{id}/pdf")]
    public async Task<IActionResult> ExportToPdf(Guid id)
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
                return NotFound();
            }

            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header()
                        .Text($"Formulario de Control de Temperatura - {form.FormNumber}")
                        .SemiBold().FontSize(16).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Spacing(10);

                            // Información general
                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text($"Destino: {form.Destination}").Bold();
                                    col.Item().Text($"Fecha de Descongelación: {form.DefrostDate:dd/MM/yyyy}");
                                    col.Item().Text($"Fecha de Producción: {form.ProductionDate:dd/MM/yyyy}");
                                });

                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text($"Estado: {form.Status}").Bold();
                                    col.Item().Text($"Creado por: {form.CreatedByUser.Name}");
                                    col.Item().Text($"Fecha: {form.CreatedAt:dd/MM/yyyy HH:mm}");
                                });
                            });

                            // Información de revisión
                            if (form.ReviewedByUser != null)
                            {
                                column.Item().LineHorizontal(1);
                                column.Item().Text("Información de Revisión").Bold().FontSize(12);
                                column.Item().Row(row =>
                                {
                                    row.RelativeItem().Text($"Revisado por: {form.ReviewedByUser.Name}");
                                    row.RelativeItem().Text($"Fecha: {form.ReviewedAt:dd/MM/yyyy HH:mm}");
                                });
                                if (!string.IsNullOrWhiteSpace(form.ReviewNotes))
                                {
                                    column.Item().Text($"Notas: {form.ReviewNotes}");
                                }
                            }

                            // Registros de temperatura
                            column.Item().LineHorizontal(1);
                            column.Item().Text("Registros de Temperatura").Bold().FontSize(12);

                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(40);  // Coche
                                    columns.RelativeColumn(2);   // Producto
                                    columns.RelativeColumn(1);   // Temp
                                    columns.RelativeColumn(1);   // Inicio Desc.
                                    columns.RelativeColumn(1);   // Inicio Cons.
                                    columns.RelativeColumn(1);   // Fin Cons.
                                    columns.RelativeColumn(2);   // Observaciones
                                });

                                // Header
                                table.Header(header =>
                                {
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Coche").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Producto").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Temp °C").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Inicio Desc.").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Inicio Cons.").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Fin Cons.").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Observaciones").Bold();
                                });

                                // Rows
                                foreach (var record in form.TemperatureRecords.OrderBy(r => r.RecordOrder))
                                {
                                    var bgColor = record.HasAlert ? Colors.Red.Lighten3 : Colors.White;

                                    table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .Padding(5).Text(record.CarNumber.ToString());
                                    table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .Padding(5).Text($"{record.ProductCode}\n{record.Product?.ProductName ?? ""}").FontSize(8);
                                    table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .Padding(5).Text(record.ProductTemperature.ToString("F1"));
                                    table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .Padding(5).Text(record.DefrostStartTime?.ToString(@"hh\:mm") ?? "-");
                                    table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .Padding(5).Text(record.ConsumptionStartTime?.ToString(@"hh\:mm") ?? "-");
                                    table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .Padding(5).Text(record.ConsumptionEndTime?.ToString(@"hh\:mm") ?? "-");
                                    table.Cell().Background(bgColor).BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .Padding(5).Text(record.Observations ?? "").FontSize(8);
                                }
                            });

                            // Alertas
                            if (form.Alerts.Any())
                            {
                                column.Item().LineHorizontal(1);
                                column.Item().Text($"Alertas ({form.Alerts.Count})").Bold().FontSize(12).FontColor(Colors.Red.Medium);

                                foreach (var alert in form.Alerts.OrderByDescending(a => a.Severity))
                                {
                                    column.Item().Background(Colors.Red.Lighten3).Padding(5).Text(alert.Message);
                                }
                            }

                            // Observaciones generales
                            if (!string.IsNullOrWhiteSpace(form.Observations))
                            {
                                column.Item().LineHorizontal(1);
                                column.Item().Text("Observaciones Generales").Bold().FontSize(12);
                                column.Item().Text(form.Observations);
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Generado el ");
                            x.Span(DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm")).SemiBold();
                            x.Span(" - Página ");
                            x.CurrentPageNumber();
                            x.Span(" de ");
                            x.TotalPages();
                        });
                });
            });

            var pdfBytes = document.GeneratePdf();
            var fileName = $"FormularioTemperatura_{form.FormNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";

            _logger.LogInformation("PDF generado para formulario {FormNumber}", form.FormNumber);

            return File(pdfBytes, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar PDF para formulario {FormId}", id);
            return StatusCode(500);
        }
    }
}

public class DailyReportDto
{
    public DateTime Date { get; set; }
    public int TotalForms { get; set; }
    public int DraftForms { get; set; }
    public int CompletedForms { get; set; }
    public int ReviewedForms { get; set; }
    public int RejectedForms { get; set; }
    public int TotalRecords { get; set; }
    public int RecordsWithAlerts { get; set; }
    public int TotalAlerts { get; set; }
    public int CriticalAlerts { get; set; }
    public int EmergencyAlerts { get; set; }
    public List<UserFormSummary> FormsByUser { get; set; } = new();
    public List<ProductUsageSummary> ProductUsage { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
}

public class UserFormSummary
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int TotalForms { get; set; }
    public int DraftForms { get; set; }
    public int CompletedForms { get; set; }
    public int ReviewedForms { get; set; }
    public int RejectedForms { get; set; }
}

public class ProductUsageSummary
{
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public int RecordsWithAlerts { get; set; }
    public decimal AverageTemperature { get; set; }
    public decimal MinTemperature { get; set; }
    public decimal MaxTemperature { get; set; }
}

public class DashboardStatisticsDto
{
    public int TotalForms { get; set; }
    public int PendingReview { get; set; }
    public int TotalRecords { get; set; }
    public int TotalAlerts { get; set; }
    public int CriticalAlerts { get; set; }
    public decimal AverageRecordsPerForm { get; set; }
    public decimal AlertRate { get; set; }
    public List<StatusCount> FormsByStatus { get; set; } = new();
    public List<DailyCount> FormsByDay { get; set; } = new();
    public List<DailyCount> AlertsByDay { get; set; } = new();
    public List<ProductCount> TopProducts { get; set; } = new();
    public DateRange DateRange { get; set; } = new();
}

public class StatusCount
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class DailyCount
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
}

public class ProductCount
{
    public string ProductCode { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class DateRange
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
