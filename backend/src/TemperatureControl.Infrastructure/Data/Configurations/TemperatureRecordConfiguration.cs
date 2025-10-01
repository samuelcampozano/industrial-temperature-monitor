using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemperatureControl.Domain.Entities;

namespace TemperatureControl.Infrastructure.Data.Configurations;

public class TemperatureRecordConfiguration : IEntityTypeConfiguration<TemperatureRecord>
{
    public void Configure(EntityTypeBuilder<TemperatureRecord> builder)
    {
        builder.ToTable("TemperatureRecords");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.CarNumber)
            .IsRequired();

        builder.Property(r => r.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.ProductTemperature)
            .IsRequired()
            .HasPrecision(5, 2);

        builder.Property(r => r.Observations)
            .HasMaxLength(500);

        builder.Property(r => r.RecordOrder)
            .IsRequired();

        builder.HasIndex(r => r.FormId);
        builder.HasIndex(r => new { r.FormId, r.RecordOrder });
    }
}
