using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemperatureControl.Domain.Entities;

namespace TemperatureControl.Infrastructure.Data.Configurations;

public class TemperatureControlFormConfiguration : IEntityTypeConfiguration<TemperatureControlForm>
{
    public void Configure(EntityTypeBuilder<TemperatureControlForm> builder)
    {
        builder.ToTable("TemperatureControlForms");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.FormNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(f => f.FormNumber)
            .IsUnique();

        builder.Property(f => f.Destination)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(f => f.DefrostDate)
            .IsRequired();

        builder.Property(f => f.ProductionDate)
            .IsRequired();

        builder.Property(f => f.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(f => f.CreatedBySignature)
            .HasColumnType("nvarchar(max)");

        builder.Property(f => f.ReviewedBySignature)
            .HasColumnType("nvarchar(max)");

        builder.Property(f => f.ReviewNotes)
            .HasMaxLength(1000);

        builder.Property(f => f.Observations)
            .HasMaxLength(2000);

        builder.Property(f => f.AttachmentUrls)
            .HasColumnType("nvarchar(max)");

        builder.Property(f => f.GeoLocation)
            .HasMaxLength(200);

        builder.HasIndex(f => f.CreatedAt);
        builder.HasIndex(f => f.Status);
        builder.HasIndex(f => f.ProductionDate);

        // Relaciones
        builder.HasMany(f => f.TemperatureRecords)
            .WithOne(r => r.Form)
            .HasForeignKey(r => r.FormId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(f => f.Alerts)
            .WithOne(a => a.Form)
            .HasForeignKey(a => a.FormId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
