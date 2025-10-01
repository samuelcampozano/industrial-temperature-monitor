# 🧪 Guía de Pruebas - Sistema de Control de Temperaturas

## 🚀 Inicio Rápido

### 1. Iniciar Sistema con Docker
```bash
# Desde la raíz del proyecto
docker-compose up -d

# Esperar a que todos los servicios estén healthy
docker-compose ps
```

### 2. Acceder a la Aplicación
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/swagger

### 3. Credenciales de Prueba
| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@temp.com | Admin123! |
| Supervisor | supervisor@temp.com | Super123! |
| Operador | operador@temp.com | Oper123! |

---

## 📋 Flujos de Prueba Principales

### Flujo 1: Login y Dashboard
1. Navegar a http://localhost:3000
2. Iniciar sesión con `admin@temp.com / Admin123!`
3. Verificar redirección al dashboard
4. Verificar tarjetas de estadísticas muestran datos
5. Verificar gráfico de temperatura se renderiza
6. Verificar lista de actividad reciente

**Resultado Esperado**: Dashboard completo con datos seed

### Flujo 2: Crear Formulario (Como Operador)
1. Login con `operador@temp.com / Oper123!`
2. Click en "Formularios" en el sidebar
3. Click en "Nuevo Formulario"
4. Llenar información:
   - Destino: "Planta Norte"
   - Fecha de Descongelación: Hoy
   - Fecha de Producción: Hoy
5. Agregar registros de temperatura:
   - Coche #1, Producto: 160, Temperatura: -18°C
   - Coche #2, Producto: 101, Temperatura: -16°C
   - Coche #3, Producto: IFK, Temperatura: -15°C
6. Agregar observaciones: "Control rutinario"
7. Capturar firma digital
8. Click en "Enviar para Revisión"

**Resultado Esperado**:
- Formulario creado con estado "Completed"
- Redirección a lista de formularios
- Nuevo formulario visible en la lista

### Flujo 3: Revisar y Aprobar (Como Supervisor)
1. Logout del operador
2. Login con `supervisor@temp.com / Super123!`
3. Ir a "Formularios"
4. Filtrar por estado "Completed"
5. Click en formulario recién creado
6. Verificar todos los datos del formulario
7. Tab "Revisión"
8. Agregar notas: "Revisado - Todo correcto"
9. Capturar firma del supervisor
10. Click en "Aprobar Formulario"

**Resultado Esperado**:
- Formulario cambia a estado "Reviewed"
- Aparece firma del supervisor
- Notas de revisión guardadas

### Flujo 4: Reportes y Estadísticas
1. Login como admin
2. Ir a "Reportes"
3. Seleccionar rango de fechas (última semana)
4. Verificar estadísticas:
   - Total de formularios
   - Formularios por estado
   - Alertas generadas
   - Temperatura promedio
5. Verificar gráficos:
   - Temperatura por producto
   - Distribución de estados
6. Click en "Exportar a PDF"
7. Click en "Exportar a Excel"

**Resultado Esperado**:
- Estadísticas precisas basadas en datos
- Gráficos interactivos funcionando
- Archivos PDF y Excel descargados

### Flujo 5: Gestión de Productos (Como Admin)
1. Login como admin
2. Ir a "Productos"
3. Click en "Nuevo Producto"
4. Llenar datos:
   - Código: "TEST-001"
   - Nombre: "Producto de Prueba"
   - Temperatura Mín: -25°C
   - Temperatura Máx: -10°C
   - Tiempo Máx Descongelación: 240 min
5. Guardar
6. Editar producto recién creado
7. Cambiar nombre a "Producto Actualizado"
8. Guardar cambios
9. Verificar cambios reflejados

**Resultado Esperado**:
- Producto creado exitosamente
- Actualización funciona
- Producto visible en selector de formularios

---

## 🔍 Pruebas de API (Swagger)

### 1. Acceder a Swagger
http://localhost:5000/swagger

### 2. Autenticación
```bash
# POST /api/auth/login
{
  "email": "admin@temp.com",
  "password": "Admin123!"
}

# Copiar el token de la respuesta
# Click en "Authorize" en Swagger
# Pegar: Bearer {token}
```

### 3. Probar Endpoints

#### GET /api/temperatureforms
- Sin parámetros: Lista todos
- Con filtros: `?status=Completed&page=1&pageSize=10`

#### GET /api/temperatureforms/{id}
- Usar un ID de los formularios seed
- Verificar que incluye records, user, alerts

#### POST /api/temperatureforms
```json
{
  "destination": "Planta Sur API",
  "defrostDate": "2024-01-15T08:00:00",
  "productionDate": "2024-01-15T14:00:00",
  "temperatureRecords": [
    {
      "carNumber": 1,
      "productCode": "160",
      "productTemperature": -18,
      "defrostStartTime": "08:00:00",
      "consumptionStartTime": "10:00:00",
      "consumptionEndTime": "12:00:00"
    }
  ]
}
```

#### GET /api/reports/statistics
- Parámetros: `?startDate=2024-01-01&endDate=2024-01-31`
- Verificar estructura de respuesta

#### GET /api/reports/export/{id}/pdf
- Usar ID de formulario existente
- Verificar descarga de PDF

---

## 🎨 Pruebas de UI/UX

### Responsive Design
1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Probar resoluciones:
   - Mobile: 375x667 (iPhone SE)
   - Tablet: 768x1024 (iPad)
   - Desktop: 1920x1080

**Verificar**:
- ✅ Sidebar se convierte en menú hamburguesa en mobile
- ✅ Tablas scrollean horizontalmente
- ✅ Botones y formularios son touch-friendly
- ✅ Textos legibles sin zoom

### Dark Mode
1. Click en icono de tema en TopBar
2. Cambiar entre Light/Dark
3. Verificar todos los componentes cambian correctamente
4. Verificar gráficos se adaptan al tema
5. Reload página - tema persiste

### Validación de Formularios
1. Crear nuevo formulario
2. Intentar enviar con campos vacíos
3. Verificar mensajes de error en español
4. Verificar validación en tiempo real
5. Probar temperaturas fuera de rango (-30°C)
6. Verificar alerta visual

---

## ⚡ Pruebas de Performance

### Load Testing Manual
```bash
# Instalar Apache Bench
sudo apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:5000/api/temperatureforms

# Verificar:
# - Requests per second > 100
# - Time per request < 100ms
# - No failed requests
```

### Frontend Performance
1. Abrir DevTools → Lighthouse
2. Generar reporte
3. Verificar scores:
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90
   - SEO: > 90

---

## 🔐 Pruebas de Seguridad

### 1. Autenticación
```bash
# Intentar acceder sin token
curl http://localhost:5000/api/temperatureforms

# Resultado esperado: 401 Unauthorized

# Con token inválido
curl -H "Authorization: Bearer invalid_token" \
     http://localhost:5000/api/temperatureforms

# Resultado esperado: 401 Unauthorized
```

### 2. Autorización (RBAC)
1. Login como Operador
2. Intentar acceder a:
   - `/products` → Debe redirigir o mostrar "No autorizado"
   - Botón "Revisar" en formulario → No visible
3. Intentar POST a `/api/products` con token de operador
   - Resultado esperado: 403 Forbidden

### 3. SQL Injection
```bash
# Intentar en campo de búsqueda
' OR '1'='1

# Resultado esperado: No inyección, búsqueda normal
```

### 4. XSS
1. En campo de observaciones, ingresar:
```html
<script>alert('XSS')</script>
```
2. Guardar y visualizar
3. Verificar que el script no se ejecuta (React escapa automáticamente)

---

## 🧪 Pruebas de Integración

### Database → API → Frontend
1. Crear formulario desde UI
2. Verificar en Swagger: `GET /api/temperatureforms`
3. Verificar en base de datos:
```bash
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P TempControl2024! \
  -Q "SELECT TOP 10 * FROM TemperatureControlDB.dbo.TemperatureForms ORDER BY CreatedAt DESC"
```

### Redis Cache
```bash
# Conectar a Redis
docker-compose exec redis redis-cli

# Verificar keys
KEYS *

# Ver un valor
GET "key_name"

# Verificar TTL
TTL "key_name"
```

---

## 📊 Pruebas de Datos

### Validar Seed Data
```sql
-- Conectar a SQL Server
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P TempControl2024!

-- Verificar usuarios
SELECT Id, Name, Email, Role FROM TemperatureControlDB.dbo.Users;

-- Verificar productos
SELECT ProductCode, ProductName, MinTemperature, MaxTemperature
FROM TemperatureControlDB.dbo.Products;

-- Verificar formularios
SELECT FormNumber, Destination, Status, CreatedAt
FROM TemperatureControlDB.dbo.TemperatureForms;

-- Verificar registros de temperatura
SELECT f.FormNumber, r.CarNumber, r.ProductCode, r.ProductTemperature
FROM TemperatureControlDB.dbo.TemperatureRecords r
JOIN TemperatureControlDB.dbo.TemperatureForms f ON r.FormId = f.Id;
```

---

## 🐛 Casos Edge

### 1. Formulario con Muchos Registros
- Crear formulario con 50+ registros de temperatura
- Verificar rendimiento al cargar
- Verificar paginación funciona

### 2. Caracteres Especiales
- Usar caracteres especiales en:
  - Destino: "Planta #1 - Área 'A' & \"B\""
  - Observaciones: "Émojis 🌡️❄️ y símbolos °C ±2"
- Verificar guardado y visualización correcta

### 3. Fechas Límite
- Fecha de descongelación: 01/01/2000
- Fecha de producción: 31/12/2099
- Verificar validación y guardado

### 4. Timeout de Sesión
1. Login
2. Esperar más de 60 minutos (o modificar JWT expiration a 1 min)
3. Intentar acción
4. Verificar refresh token automático o redirect a login

### 5. Conexión Inestable
1. Crear formulario
2. Desconectar red (DevTools → Network → Offline)
3. Intentar guardar
4. Reconectar red
5. Verificar auto-retry o mensaje de error apropiado

---

## ✅ Checklist Completo de Pruebas

### Funcionalidad
- [ ] Login con diferentes roles
- [ ] Logout
- [ ] Refresh token automático
- [ ] Crear formulario
- [ ] Editar formulario (estado Draft)
- [ ] Eliminar formulario
- [ ] Revisar formulario (Supervisor)
- [ ] Aprobar formulario
- [ ] Rechazar formulario
- [ ] Agregar registro de temperatura
- [ ] Editar registro de temperatura
- [ ] Eliminar registro de temperatura
- [ ] Firma digital funciona
- [ ] Ver dashboard con estadísticas
- [ ] Generar reportes
- [ ] Exportar a PDF
- [ ] Exportar a Excel
- [ ] CRUD productos (Admin)
- [ ] Filtros en lista de formularios
- [ ] Búsqueda funciona
- [ ] Paginación funciona

### UI/UX
- [ ] Responsive en mobile
- [ ] Responsive en tablet
- [ ] Dark mode funciona
- [ ] Tema persiste al reload
- [ ] Navegación fluida
- [ ] Breadcrumbs correctos
- [ ] Loading states visibles
- [ ] Error messages en español
- [ ] Toast notifications funcionan
- [ ] Modals abren/cierran correctamente
- [ ] Formularios validan en tiempo real
- [ ] Tablas ordenables
- [ ] Gráficos interactivos

### Performance
- [ ] Página carga < 3 segundos
- [ ] API responde < 500ms
- [ ] Sin memory leaks (check DevTools)
- [ ] Imágenes optimizadas
- [ ] Lazy loading funciona

### Seguridad
- [ ] No se puede acceder sin auth
- [ ] RBAC funciona correctamente
- [ ] Tokens expiran
- [ ] No SQL injection
- [ ] No XSS
- [ ] HTTPS en producción
- [ ] CORS configurado
- [ ] Passwords hasheados

### Datos
- [ ] Seed data cargado
- [ ] CRUD operations funcionan
- [ ] Soft delete funciona
- [ ] Timestamps automáticos
- [ ] Audit logs se crean
- [ ] Relaciones FK correctas
- [ ] Validaciones de negocio funcionan

---

## 🚨 Reporte de Bugs

### Template
```markdown
**Título**: [Breve descripción]

**Severidad**: Critical / High / Medium / Low

**Pasos para Reproducir**:
1.
2.
3.

**Resultado Esperado**:

**Resultado Actual**:

**Screenshots/Logs**:

**Entorno**:
- OS:
- Browser:
- Version:
```

### Dónde Reportar
- GitHub Issues: https://github.com/tu-usuario/temperature-control-system/issues

---

## 📈 Métricas de Éxito

### Criterios de Aceptación
- ✅ Todos los flujos principales funcionan
- ✅ 0 errores críticos
- ✅ < 5 errores menores
- ✅ Performance score > 85
- ✅ Responsive en 3 dispositivos
- ✅ Dark mode funciona
- ✅ RBAC implementado correctamente

---

**Última actualización**: 2024-01-15
**Autor**: Equipo de QA
