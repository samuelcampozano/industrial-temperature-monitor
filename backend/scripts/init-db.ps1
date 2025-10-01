# PowerShell script to initialize the database with migrations and seed data
# Usage: .\scripts\init-db.ps1

$ErrorActionPreference = "Stop"

Write-Host "Temperature Control API - Database Initialization" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if dotnet CLI is available
try {
    $dotnetVersion = dotnet --version
    Write-Host "Using .NET SDK version: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: dotnet CLI is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Navigate to the backend directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Split-Path -Parent $ScriptDir
$InfraProject = Join-Path $BackendDir "src\TemperatureControl.Infrastructure"
$ApiProject = Join-Path $BackendDir "src\TemperatureControl.API"

Set-Location $BackendDir

Write-Host "Step 1: Installing EF Core tools (if not already installed)..." -ForegroundColor Yellow
try {
    dotnet tool install --global dotnet-ef 2>$null
} catch {
    Write-Host "EF Core tools already installed" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Step 2: Building the solution..." -ForegroundColor Yellow
dotnet build --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host ""

Write-Host "Step 3: Applying database migrations..." -ForegroundColor Yellow
dotnet ef database update `
    --project $InfraProject `
    --startup-project $ApiProject `
    --verbose

if ($LASTEXITCODE -ne 0) {
    Write-Host "Migration failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host ""

Write-Host "Step 4: Database initialization completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Default users created:" -ForegroundColor Cyan
Write-Host "  - admin@temp.com / Admin123! (Administrator)" -ForegroundColor White
Write-Host "  - supervisor@temp.com / Super123! (Supervisor)" -ForegroundColor White
Write-Host "  - operador@temp.com / Oper123! (Operator)" -ForegroundColor White
Write-Host "  - auditor@temp.com / Audit123! (Auditor)" -ForegroundColor White
Write-Host ""
Write-Host "Sample data:" -ForegroundColor Cyan
Write-Host "  - 6 Products (160, 101, IFK, IFG, 202, 303)" -ForegroundColor White
Write-Host "  - 3 Temperature Forms with records" -ForegroundColor White
Write-Host ""
Write-Host "You can now start the API with: dotnet run --project src\TemperatureControl.API" -ForegroundColor Green
