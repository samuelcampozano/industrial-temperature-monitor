# 🚀 Guía de Despliegue - Sistema de Control de Temperaturas

## Tabla de Contenidos
- [Despliegue Local con Docker](#despliegue-local-con-docker)
- [Despliegue en Producción](#despliegue-en-producción)
- [Variables de Entorno](#variables-de-entorno)
- [Troubleshooting](#troubleshooting)

---

## 🐳 Despliegue Local con Docker

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado
- 8GB RAM mínimo
- 20GB espacio en disco

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/temperature-control-system.git
cd temperature-control-system
```

### Paso 2: Configurar Variables de Entorno
```bash
# Copiar archivos de ejemplo
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
```

### Paso 3: Iniciar Servicios
```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps
```

### Paso 4: Acceder a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **Hangfire Dashboard**: http://localhost:5000/hangfire

### Credenciales por Defecto
| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Admin | admin@temp.com | SecurePass123! | Administrator |
| Supervisor | supervisor@temp.com | SecurePass123! | Supervisor |
| Operador | operador@temp.com | SecurePass123! | Operator |
| Auditor | auditor@temp.com | Audit123! | Auditor |

### Detener Servicios
```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina datos)
docker-compose down -v
```

---

## 🌐 Despliegue en Producción

### Opción 1: Azure App Service

#### Backend (API)
```bash
# 1. Crear App Service
az webapp create \
  --name temperature-control-api \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --runtime "DOTNETCORE:8.0"

# 2. Configurar variables de entorno
az webapp config appsettings set \
  --name temperature-control-api \
  --resource-group myResourceGroup \
  --settings \
    ConnectionStrings__DefaultConnection="<SQL_CONNECTION>" \
    ConnectionStrings__Redis="<REDIS_CONNECTION>" \
    JWT__Secret="<SECRET>"

# 3. Desplegar
cd backend
dotnet publish -c Release
az webapp deployment source config-zip \
  --name temperature-control-api \
  --resource-group myResourceGroup \
  --src ./publish.zip
```

#### Frontend (Next.js)
```bash
# Desplegar a Vercel (recomendado)
npm i -g vercel
cd frontend
vercel --prod

# O Azure Static Web Apps
az staticwebapp create \
  --name temperature-control-frontend \
  --resource-group myResourceGroup \
  --source . \
  --location "eastus2" \
  --branch main \
  --app-location "frontend" \
  --output-location ".next"
```

### Opción 2: AWS

#### Backend (Elastic Beanstalk)
```bash
# 1. Instalar EB CLI
pip install awsebcli

# 2. Inicializar
cd backend
eb init -p docker temperature-control-api

# 3. Crear entorno
eb create production --database --database.engine sqlserver

# 4. Desplegar
eb deploy
```

#### Frontend (Amplify)
```bash
# 1. Instalar Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configurar
cd frontend
amplify init

# 3. Agregar hosting
amplify add hosting

# 4. Publicar
amplify publish
```

### Opción 3: Railway (Más Simple)

#### Backend + Base de Datos
1. Ir a [Railway.app](https://railway.app)
2. Crear nuevo proyecto
3. Agregar SQL Server desde template
4. Agregar servicio desde GitHub (seleccionar carpeta `backend`)
5. Configurar variables de entorno
6. Deploy automático

#### Frontend
1. Agregar nuevo servicio
2. Seleccionar carpeta `frontend`
3. Configurar variables:
   - `NEXT_PUBLIC_API_URL`: URL del backend
4. Deploy automático

---

## 🔐 Variables de Entorno

### Backend (.env)
```env
# Database
ConnectionStrings__DefaultConnection=Server=...
ConnectionStrings__Redis=...

# JWT
JWT__Secret=<GENERAR_CON: openssl rand -base64 64>
JWT__Issuer=TemperatureControlAPI
JWT__Audience=TemperatureControlClient
JWT__ExpirationMinutes=60

# SMTP (Opcional)
Smtp__Host=smtp.gmail.com
Smtp__Port=587
Smtp__User=your-email@gmail.com
Smtp__Password=your-app-password

# Application Insights (Opcional)
APPLICATIONINSIGHTS_CONNECTION_STRING=...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_SIGNALR_URL=https://api.tudominio.com/hubs
NEXT_PUBLIC_ENV=production
```

---

## 🔧 Configuración de Base de Datos

### SQL Server Production Setup
```sql
-- 1. Crear base de datos
CREATE DATABASE TemperatureControlDB;
GO

-- 2. Crear usuario para la aplicación
CREATE LOGIN temperature_app WITH PASSWORD = '<STRONG_PASSWORD>';
GO

USE TemperatureControlDB;
GO

CREATE USER temperature_app FOR LOGIN temperature_app;
GO

EXEC sp_addrolemember 'db_owner', 'temperature_app';
GO

-- 3. Configurar backup automático (recomendado)
-- Configurar en SQL Server Management Studio o Azure Portal
```

### Redis Production Setup
```bash
# Azure Cache for Redis
az redis create \
  --name temperature-control-cache \
  --resource-group myResourceGroup \
  --location eastus \
  --sku Standard \
  --vm-size C1

# Obtener connection string
az redis list-keys \
  --name temperature-control-cache \
  --resource-group myResourceGroup
```

---

## 📊 Monitoreo y Logs

### Application Insights (Azure)
```bash
# Instalar en backend
dotnet add package Microsoft.ApplicationInsights.AspNetCore

# Configurar en Program.cs
builder.Services.AddApplicationInsightsTelemetry();
```

### Serilog para Logs Estructurados
Ya configurado en `backend/src/TemperatureControl.API/Program.cs`

Logs disponibles en:
- `backend/logs/log-YYYYMMDD.txt`
- Azure Application Insights (si configurado)
- Docker logs: `docker-compose logs -f backend`

---

## 🔒 Seguridad en Producción

### Checklist
- ✅ Cambiar todas las contraseñas por defecto
- ✅ Usar HTTPS (configurar SSL/TLS)
- ✅ Configurar CORS restrictivo
- ✅ Habilitar rate limiting
- ✅ Configurar firewall (solo puertos necesarios)
- ✅ Habilitar autenticación en Hangfire Dashboard
- ✅ Configurar backups automáticos de BD
- ✅ Usar secretos en Azure Key Vault o AWS Secrets Manager
- ✅ Habilitar audit logs
- ✅ Configurar SSL para Redis

### HTTPS con Let's Encrypt (Nginx Reverse Proxy)
```nginx
# nginx.conf
server {
    listen 80;
    server_name api.tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/api.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /hubs/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 🧪 Testing en Producción

### Health Checks
```bash
# Backend health
curl https://api.tudominio.com/health

# Respuesta esperada:
# {"status":"healthy","timestamp":"2024-01-15T12:00:00Z"}

# Frontend health
curl https://tudominio.com/api/health
```

### Load Testing con k6
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('https://api.tudominio.com/api/temperatureforms');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

```bash
k6 run load-test.js
```

---

## 🐛 Troubleshooting

### Problema: Database Connection Failed
```bash
# Verificar conectividad
docker-compose exec backend dotnet ef database update

# Ver logs de SQL Server
docker-compose logs sqlserver

# Verificar cadena de conexión
docker-compose exec backend env | grep ConnectionStrings
```

### Problema: Redis Connection Timeout
```bash
# Verificar Redis
docker-compose exec redis redis-cli ping
# Debe responder: PONG

# Ver logs
docker-compose logs redis
```

### Problema: Frontend no conecta con Backend
```bash
# Verificar CORS en backend
# backend/src/TemperatureControl.API/appsettings.json
{
  "CORS": {
    "AllowedOrigins": [
      "https://tudominio.com",
      "http://localhost:3000"
    ]
  }
}

# Verificar variable de entorno en frontend
echo $NEXT_PUBLIC_API_URL
```

### Problema: JWT Token Expired
```bash
# Ajustar tiempo de expiración
# backend/src/TemperatureControl.API/appsettings.json
{
  "JWT": {
    "ExpirationMinutes": 120  // Aumentar a 2 horas
  }
}
```

### Logs Útiles
```bash
# Ver todos los logs
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo errores
docker-compose logs backend | grep ERROR

# Últimas 100 líneas
docker-compose logs --tail=100 backend
```

---

## 📈 Escalabilidad

### Configuración Recomendada por Tamaño

#### Pequeño (< 100 usuarios)
- Backend: 1 instancia (2 vCPU, 4GB RAM)
- Database: Azure SQL Basic (2GB)
- Redis: Standard C0 (250MB)
- Frontend: Vercel Hobby Plan

#### Mediano (100-1000 usuarios)
- Backend: 2-3 instancias con Load Balancer
- Database: Azure SQL S2 (50GB)
- Redis: Standard C1 (1GB)
- Frontend: Vercel Pro

#### Grande (> 1000 usuarios)
- Backend: Auto-scaling (3-10 instancias)
- Database: Azure SQL P2 (250GB) con replica de lectura
- Redis: Premium P1 (6GB) con clustering
- Frontend: Vercel Enterprise
- CDN: Azure CDN o CloudFlare

---

## 🎯 Checklist de Despliegue

### Pre-Deployment
- [ ] Todas las pruebas pasan
- [ ] Variables de entorno configuradas
- [ ] Secretos generados (JWT, DB passwords)
- [ ] SSL/TLS certificados obtenidos
- [ ] Backup de base de datos configurado
- [ ] Monitoreo configurado (Application Insights)
- [ ] Rate limiting configurado
- [ ] CORS configurado correctamente

### Post-Deployment
- [ ] Health checks responden
- [ ] Smoke tests pasan
- [ ] Logs funcionando correctamente
- [ ] Alertas configuradas
- [ ] Documentación actualizada
- [ ] Usuario admin creado
- [ ] Datos de prueba sembrados (staging)
- [ ] Load testing completado

---

## 📞 Soporte

Para problemas de despliegue, contactar:
- **Email**: support@temperaturecontrol.com
- **Issues**: https://github.com/tu-usuario/temperature-control-system/issues
- **Documentación**: https://docs.temperaturecontrol.com

---

**Última actualización**: 2024-01-15
