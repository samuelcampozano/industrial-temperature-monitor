using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemperatureControl.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MinTemperature = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    MaxTemperature = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    MaxDefrostTimeMinutes = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TemperatureControlForms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Destination = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DefrostDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProductionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedBySignature = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewedBySignature = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReviewedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Observations = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AttachmentUrls = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GeoLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemperatureControlForms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemperatureControlForms_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TemperatureControlForms_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TemperatureRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CarNumber = table.Column<int>(type: "int", nullable: false),
                    ProductCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DefrostStartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    ProductTemperature = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    ConsumptionStartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    ConsumptionEndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    Observations = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RecordOrder = table.Column<int>(type: "int", nullable: false),
                    HasAlert = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemperatureRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemperatureRecords_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TemperatureRecords_TemperatureControlForms_FormId",
                        column: x => x.FormId,
                        principalTable: "TemperatureControlForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TemperatureAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecordId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Severity = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Temperature = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpectedMinTemperature = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpectedMaxTemperature = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsAcknowledged = table.Column<bool>(type: "bit", nullable: false),
                    AcknowledgedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcknowledgedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EmailSent = table.Column<bool>(type: "bit", nullable: false),
                    SmsSent = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemperatureAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemperatureAlerts_TemperatureControlForms_FormId",
                        column: x => x.FormId,
                        principalTable: "TemperatureControlForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TemperatureAlerts_TemperatureRecords_RecordId",
                        column: x => x.RecordId,
                        principalTable: "TemperatureRecords",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TemperatureAlerts_Users_AcknowledgedByUserId",
                        column: x => x.AcknowledgedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductCode",
                table: "Products",
                column: "ProductCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureAlerts_AcknowledgedByUserId",
                table: "TemperatureAlerts",
                column: "AcknowledgedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureAlerts_FormId",
                table: "TemperatureAlerts",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureAlerts_RecordId",
                table: "TemperatureAlerts",
                column: "RecordId");

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureControlForms_CreatedAt",
                table: "TemperatureControlForms",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureControlForms_CreatedByUserId",
                table: "TemperatureControlForms",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureControlForms_FormNumber",
                table: "TemperatureControlForms",
                column: "FormNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureControlForms_ProductionDate",
                table: "TemperatureControlForms",
                column: "ProductionDate");

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureControlForms_ReviewedByUserId",
                table: "TemperatureControlForms",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureControlForms_Status",
                table: "TemperatureControlForms",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureRecords_FormId",
                table: "TemperatureRecords",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureRecords_FormId_RecordOrder",
                table: "TemperatureRecords",
                columns: new[] { "FormId", "RecordOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_TemperatureRecords_ProductId",
                table: "TemperatureRecords",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "TemperatureAlerts");

            migrationBuilder.DropTable(
                name: "TemperatureRecords");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "TemperatureControlForms");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
