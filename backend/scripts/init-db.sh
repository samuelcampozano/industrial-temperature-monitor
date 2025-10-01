#!/bin/bash

# Script to initialize the database with migrations and seed data
# Usage: ./scripts/init-db.sh

set -e

echo "Temperature Control API - Database Initialization"
echo "=================================================="
echo ""

# Check if dotnet CLI is available
if ! command -v dotnet &> /dev/null; then
    echo "Error: dotnet CLI is not installed or not in PATH"
    exit 1
fi

# Navigate to the Infrastructure project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
INFRA_PROJECT="$BACKEND_DIR/src/TemperatureControl.Infrastructure"
API_PROJECT="$BACKEND_DIR/src/TemperatureControl.API"

cd "$BACKEND_DIR"

echo "Step 1: Installing EF Core tools (if not already installed)..."
dotnet tool install --global dotnet-ef 2>/dev/null || echo "EF Core tools already installed"
echo ""

echo "Step 2: Building the solution..."
dotnet build --configuration Release
echo ""

echo "Step 3: Applying database migrations..."
dotnet ef database update \
    --project "$INFRA_PROJECT" \
    --startup-project "$API_PROJECT" \
    --verbose
echo ""

echo "Step 4: Database initialization completed successfully!"
echo ""
echo "Default users created:"
echo "  - admin@temp.com / Admin123! (Administrator)"
echo "  - supervisor@temp.com / Super123! (Supervisor)"
echo "  - operador@temp.com / Oper123! (Operator)"
echo "  - auditor@temp.com / Audit123! (Auditor)"
echo ""
echo "Sample data:"
echo "  - 6 Products (160, 101, IFK, IFG, 202, 303)"
echo "  - 3 Temperature Forms with records"
echo ""
echo "You can now start the API with: dotnet run --project src/TemperatureControl.API"
