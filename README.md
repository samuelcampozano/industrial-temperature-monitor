# 🌡️ Sistema de Control de Temperaturas para Conservas

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC2927?logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Sistema digital innovador para el control y monitoreo de temperaturas de productos destinados a conservas, transformando procesos manuales en papel a una solución moderna, eficiente y en tiempo real.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación API](#-documentación-api)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características Principales

### 🎯 Funcionalidades Core
- ✅ **Formularios Digitales**: Reemplazo completo del sistema manual en papel
- ✅ **Monitoreo en Tiempo Real**: Dashboard con actualizaciones instantáneas vía SignalR
- ✅ **Alertas Inteligentes**: Notificaciones automáticas para desviaciones de temperatura
- ✅ **Múltiples Formatos de Exportación**: PDF, Excel, CSV para reportes
- ✅ **Firma Digital**: Captura de firmas para "Realizado por" y "Revisado por"
- ✅ **Modo Offline**: Funcionalidad PWA para trabajar sin conexión
- ✅ **Responsive Design**: Optimizado para tablets y dispositivos móviles de campo

### 🚀 Innovaciones Destacadas
- 🤖 **Predicción de Temperaturas**: ML.NET para análisis predictivo
- 📊 **Detección de Anomalías**: Identificación automática de lecturas inusuales
- 📱 **Escaneo de Códigos**: Integración con lectores de código de barras
- 🌐 **Multi-idioma**: Soporte español/inglés
- 🔔 **Notificaciones Push**: Alertas por email y SMS
- 📸 **Captura de Evidencias**: Integración con cámara para fotos de respaldo
- 🗺️ **Geolocalización**: Registro GPS de ubicación en creación de formularios

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │   Forms      │  │   Reports    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / SignalR
┌────────────────────────┴────────────────────────────────────┐
│              Backend (.NET 8 Minimal API)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Vertical Slice Architecture + CQRS           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │ Commands │  │  Queries │  │   Notifications  │  │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Infrastructure Layer                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │ EF Core  │  │  Redis   │  │    Hangfire      │  │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                    SQL Server Database                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │TemperatureDB │  │   Products   │  │    Users     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: .NET 8 (Minimal APIs)
- **Arquitectura**: Vertical Slice Architecture + CQRS
- **ORM**: Entity Framework Core 8
- **Validación**: FluentValidation
- **Mediador**: MediatR
- **Logging**: Serilog
- **Mapping**: AutoMapper
- **Auth**: JWT Bearer Tokens
- **Real-time**: SignalR
- **Background Jobs**: Hangfire
- **Cache**: Redis
- **Testing**: xUnit, FluentAssertions, Moq

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript 5.0
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Real-time**: SignalR Client
- **Testing**: Jest, React Testing Library, Playwright

### Base de Datos
- **RDBMS**: SQL Server 2022
- **Cache**: Redis 7
- **Migraciones**: EF Core Code-First

### DevOps
- **Containerización**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoreo**: Application Insights
- **Code Quality**: SonarQube

## 📦 Requisitos Previos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) o superior
- [Node.js 20+](https://nodejs.org/) y npm/pnpm
- [SQL Server 2022](https://www.microsoft.com/sql-server) (Express o superior)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (opcional, recomendado)
- [Git](https://git-scm.com/)

## 🚀 Instalación y Configuración

### Opción 1: Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/temperature-control-system.git
cd temperature-control-system

# Iniciar todos los servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend dotnet ef database update

# La aplicación estará disponible en:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - Swagger: http://localhost:5000/swagger
```

### Opción 2: Instalación Local

#### Backend

```bash
cd backend/src/TemperatureControl.API

# Restaurar dependencias
dotnet restore

# Configurar cadena de conexión en appsettings.Development.json
# "ConnectionStrings": {
#   "DefaultConnection": "Server=localhost;Database=TemperatureControlDB;Trusted_Connection=True;TrustServerCertificate=True"
# }

# Ejecutar migraciones
dotnet ef database update

# Iniciar API
dotnet run
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install
# o
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las URLs del backend

# Iniciar servidor de desarrollo
npm run dev
# o
pnpm dev
```

## 📁 Estructura del Proyecto

```
temperature-control-system/
├── backend/
│   ├── src/
│   │   ├── TemperatureControl.API/           # API Endpoints y Configuración
│   │   │   ├── Features/                     # Vertical Slices
│   │   │   │   ├── TemperatureForms/
│   │   │   │   ├── TemperatureRecords/
│   │   │   │   ├── Reports/
│   │   │   │   └── Authentication/
│   │   │   ├── Hubs/                         # SignalR Hubs
│   │   │   ├── Middleware/
│   │   │   └── Program.cs
│   │   ├── TemperatureControl.Domain/        # Entidades y Value Objects
│   │   │   ├── Entities/
│   │   │   ├── Enums/
│   │   │   └── Interfaces/
│   │   ├── TemperatureControl.Infrastructure/ # Implementaciones
│   │   │   ├── Data/
│   │   │   ├── Repositories/
│   │   │   ├── Services/
│   │   │   └── Migrations/
│   │   └── TemperatureControl.Tests/         # Tests
│   │       ├── Unit/
│   │       ├── Integration/
│   │       └── Helpers/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                              # Next.js App Router
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   ├── forms/
│   │   │   └── reports/
│   │   ├── components/                       # Componentes React
│   │   │   ├── ui/                          # Componentes base
│   │   │   ├── forms/
│   │   │   ├── charts/
│   │   │   └── layout/
│   │   ├── lib/                             # Utilidades y configuración
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── stores/                          # Estado global (Zustand)
│   │   └── types/                           # TypeScript definitions
│   ├── public/
│   └── Dockerfile
├── database/
│   ├── migrations/                           # Scripts SQL
│   ├── seeds/                               # Datos de prueba
│   └── scripts/                             # Utilidades DB
├── docs/
│   ├── api/                                 # Documentación API
│   ├── architecture/                        # Diagramas y decisiones
│   └── user-manual/                         # Manual de usuario
├── .github/
│   └── workflows/                           # CI/CD pipelines
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── deploy.yml
├── docker-compose.yml
├── docker-compose.override.yml
└── README.md
```

## 📚 Documentación API

La documentación completa de la API está disponible a través de Swagger UI:

- **Desarrollo**: http://localhost:5000/swagger
- **Producción**: https://api.tudominio.com/swagger

### Endpoints Principales

#### Autenticación
```http
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
```

#### Formularios de Temperatura
```http
GET    /api/temperature-forms              # Listar formularios (paginado)
POST   /api/temperature-forms              # Crear formulario
GET    /api/temperature-forms/{id}         # Obtener formulario específico
PUT    /api/temperature-forms/{id}         # Actualizar formulario
DELETE /api/temperature-forms/{id}         # Eliminar formulario (soft delete)
PATCH  /api/temperature-forms/{id}/review  # Marcar como revisado
```

#### Registros de Temperatura
```http
POST   /api/temperature-records            # Agregar registro
PUT    /api/temperature-records/{id}       # Actualizar registro
DELETE /api/temperature-records/{id}       # Eliminar registro
GET    /api/temperature-records/form/{formId}  # Obtener por formulario
```

#### Reportes
```http
GET /api/reports/daily?date={date}         # Reporte diario
GET /api/reports/export/{id}/pdf           # Exportar a PDF
GET /api/reports/export/{id}/excel         # Exportar a Excel
GET /api/reports/statistics                # Estadísticas generales
```

#### Dashboard
```http
GET /api/dashboard/stats                   # Estadísticas en tiempo real
GET /api/dashboard/alerts                  # Alertas activas
GET /api/dashboard/recent-activity         # Actividad reciente
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Ejecutar todos los tests
dotnet test

# Con coverage
dotnet test /p:CollectCoverage=true /p:CoverageReportFormat=opencover

# Tests específicos
dotnet test --filter "Category=Unit"
dotnet test --filter "Category=Integration"
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚢 Despliegue

### Producción con Docker

```bash
# Build y deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Ver logs
docker-compose logs -f

# Ejecutar migraciones en producción
docker-compose exec backend dotnet ef database update
```

### CI/CD Pipeline

El proyecto incluye workflows de GitHub Actions para:

1. **Build y Test automático** en cada push
2. **Code Quality** con SonarQube
3. **Despliegue automático** a staging en merge a develop
4. **Despliegue a producción** en release tags (v*.*.*)

## 📖 Manual de Usuario

Consulta el [Manual de Usuario completo](docs/user-manual/README.md) con capturas de pantalla y guías paso a paso.

### Quick Start para Usuarios

1. **Acceder al sistema**: http://tudominio.com
2. **Iniciar sesión** con credenciales proporcionadas
3. **Crear nuevo formulario**: Dashboard → "Nuevo Formulario"
4. **Llenar datos**:
   - Destino y fechas
   - Agregar registros de temperatura por coche
   - Incluir observaciones si es necesario
5. **Firmar digitalmente** al completar
6. **Enviar para revisión**

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: Samuel Campozano
- **Contacto**: contact@example.com

## 🙏 Agradecimientos

- Inspirado en la necesidad real de digitalizar procesos industriales
- Diseñado para trabajadores de campo y supervisores
- Construido con las mejores prácticas de la industria

---

**Desarrollado con ❤️ para modernizar la industria de conservas**
