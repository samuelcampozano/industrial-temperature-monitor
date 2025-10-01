# 🎬 Demo Walkthrough - Sistema de Control de Temperaturas

## 🚀 Quick Start (5 minutos)

### Paso 1: Iniciar el Sistema
```bash
# Abrir terminal en d:\Asiservis
docker-compose up -d

# Esperar ~2 minutos para que todos los servicios inicien
# Verificar estado
docker-compose ps
```

**Resultado esperado:**
```
NAME                              STATUS              PORTS
temperaturecontrol-api            Up (healthy)        0.0.0.0:5000->5000/tcp
temperaturecontrol-frontend       Up                  0.0.0.0:3000->3000/tcp
temperaturecontrol-redis          Up (healthy)        0.0.0.0:6379->6379/tcp
temperaturecontrol-sqlserver      Up (healthy)        0.0.0.0:1433->1433/tcp
```

### Paso 2: Acceder a la Aplicación
Abrir navegador en: **http://localhost:3000**

### Paso 3: Login
**Credenciales:**
- Email: `admin@temp.com`
- Password: `Admin123!`

---

## 📱 Tour Completo de la Aplicación

### 1. Dashboard (Pantalla Principal)
**Ubicación:** http://localhost:3000/dashboard

**Qué Ver:**
- ✅ **4 Tarjetas de Estadísticas:**
  - Total Formularios: ~3 (datos seed)
  - Formularios Revisados: ~1
  - Alertas Activas: ~1
  - Total Productos: ~6

- ✅ **Gráfico de Temperaturas:**
  - Líneas de tendencia por producto
  - Interactivo (hover muestra detalles)
  - Responsive a diferentes tamaños

- ✅ **Actividad Reciente:**
  - Lista de últimas acciones
  - Avatares y timestamps
  - Estados con colores (Draft=amarillo, Completed=azul, Reviewed=verde)

**Acciones a Probar:**
1. Hover sobre tarjetas estadísticas
2. Click en puntos del gráfico
3. Cambiar tema (sol/luna en top bar)
4. Reducir ventana (verificar responsive)

---

### 2. Gestión de Formularios
**Ubicación:** http://localhost:3000/forms

#### 2.1 Lista de Formularios
**Qué Ver:**
- Tabla con formularios seed
- Columnas: Número, Destino, Fecha Producción, Estado, Acciones
- Badges de estado con colores
- Filtros superiores
- Paginación inferior

**Acciones a Probar:**
1. **Filtrar por Estado:**
   - Dropdown "Estado" → Seleccionar "Completed"
   - Verificar que filtra correctamente

2. **Búsqueda:**
   - Input "Buscar..." → Escribir "Norte"
   - Ver filtrado en tiempo real

3. **Ver Detalles:**
   - Click en botón "Ver" (ícono ojo)
   - Navega a detalle del formulario

#### 2.2 Crear Nuevo Formulario
**Ubicación:** http://localhost:3000/forms/new

**Paso a Paso:**

**Paso 1: Información del Formulario**
1. Destino: `"Planta Sur - Demo"`
2. Fecha Descongelación: Hoy
3. Fecha Producción: Hoy
4. Click "Siguiente"

**Paso 2: Registros de Temperatura**
1. **Primer Registro:**
   - Coche #: `1`
   - Producto: Seleccionar `160` del dropdown
   - Temperatura: `-18` °C
   - Hora Inicio Descongelación: `08:00`
   - Hora Inicio Consumo: `10:00`
   - Hora Fin Consumo: `12:00`
   - Observaciones: `"Control rutinario"`
   - Click "Agregar Registro"

2. **Segundo Registro:**
   - Coche #: `2`
   - Producto: `101`
   - Temperatura: `-16` °C
   - Horas: `08:30`, `10:30`, `12:30`
   - Click "Agregar Registro"

3. **Tercer Registro (con alerta):**
   - Coche #: `3`
   - Producto: `IFK`
   - Temperatura: `-12` °C ⚠️ (cerca del límite)
   - Horas: `09:00`, `11:00`, `13:00`
   - Observaciones: `"Temperatura al límite - monitorear"`
   - Click "Agregar Registro"
   - **Verificar:** Indicador de alerta naranja aparece

4. Click "Siguiente"

**Paso 3: Firmas**
1. **Firma del Operador:**
   - Click en área de firma
   - Dibujar firma con mouse/touch
   - Click "Guardar Firma"

2. Observaciones finales (opcional): `"Formulario creado para demostración"`

3. Click "Enviar para Revisión"

**Resultado:** Redirige a lista, nuevo formulario visible con estado "Completed"

#### 2.3 Ver Detalle de Formulario
**Ubicación:** http://localhost:3000/forms/[id]

**Qué Ver:**
- **Tab "Detalles":**
  - Información del formulario
  - Usuario que creó
  - Fechas
  - Estado actual

- **Tab "Registros de Temperatura":**
  - Tabla con todos los registros
  - Columnas: Coche, Producto, Temperatura, Tiempos, Observaciones
  - Indicadores de alerta en rojo/naranja
  - Acciones: Editar, Eliminar (si estado = Draft)

- **Tab "Firmas":**
  - Firma del operador (imagen)
  - Timestamp
  - Si está revisado: Firma del supervisor

- **Tab "Revisión"** (solo supervisores/admins):
  - Notas de revisión
  - Botones: Aprobar / Rechazar

**Acciones a Probar:**
1. Navegar entre tabs
2. Ver detalles de cada registro
3. Si es admin, ir a tab Revisión

---

### 3. Revisar Formulario (Como Supervisor)
**Paso 1: Cambiar de Usuario**
1. Click en avatar (top right)
2. "Cerrar Sesión"
3. Login con:
   - Email: `supervisor@temp.com`
   - Password: `Super123!`

**Paso 2: Buscar Formulario Pendiente**
1. Ir a "Formularios"
2. Filtrar por estado "Completed"
3. Click en "Ver" del formulario recién creado

**Paso 3: Revisar**
1. Tab "Revisión"
2. Notas: `"Revisado - Temperaturas dentro de rango aceptable. Monitorear coche #3."`
3. **Firma del Supervisor:**
   - Dibujar firma
   - Guardar
4. Click "Aprobar Formulario"

**Resultado:**
- Estado cambia a "Reviewed"
- Badge verde
- Firma del supervisor visible en tab Firmas

---

### 4. Reportes y Estadísticas
**Ubicación:** http://localhost:3000/reports

**Qué Ver:**
- **Filtros:**
  - Rango de fechas (última semana por defecto)
  - Selector de producto
  - Estado del formulario

- **Estadísticas Generales:**
  - Total formularios en rango
  - Formularios por estado (gráfico de dona)
  - Alertas generadas
  - Temperatura promedio

- **Gráfico de Temperaturas:**
  - Barras por producto
  - Muestra min/max/promedio
  - Interactivo

- **Tabla de Detalle:**
  - Formulario | Destino | Registros | Alertas | Fecha
  - Ordenable por columna

**Acciones a Probar:**
1. **Cambiar Rango de Fechas:**
   - Click en selector de fechas
   - Seleccionar "Últimos 30 días"
   - Verificar que estadísticas se actualizan

2. **Filtrar por Producto:**
   - Dropdown "Producto" → Seleccionar "160"
   - Ver solo registros de ese producto

3. **Exportar a PDF:**
   - Click botón "Exportar PDF"
   - Verifica descarga de archivo
   - Abrir PDF: debe contener todos los datos con formato profesional

4. **Exportar a Excel:**
   - Click botón "Exportar Excel"
   - Verifica descarga
   - Abrir en Excel: debe contener datos tabulados

---

### 5. Gestión de Productos (Solo Admin)
**Ubicación:** http://localhost:3000/products

**Qué Ver:**
- Tabla con catálogo de productos
- Columnas: Código, Nombre, Temp Min, Temp Max, Tiempo Max Descongelación
- Badge "Activo" / "Inactivo"
- Botones: Editar, Eliminar (solo admin)

**Acciones a Probar:**

#### 5.1 Crear Nuevo Producto
1. Click "Nuevo Producto"
2. Llenar formulario:
   - Código: `TEST-001`
   - Nombre: `Producto de Prueba Demo`
   - Temperatura Mínima: `-25` °C
   - Temperatura Máxima: `-10` °C
   - Tiempo Máx Descongelación: `240` minutos
   - Categoría: `Conservas`
   - Descripción: `Producto creado para demostración del sistema`
   - Activo: ✅ Sí
3. Click "Guardar"

**Resultado:** Producto aparece en la lista

#### 5.2 Editar Producto
1. Click botón "Editar" en el producto TEST-001
2. Cambiar nombre a: `Producto Demo Actualizado`
3. Guardar

**Resultado:** Cambio reflejado en la tabla

#### 5.3 Desactivar Producto
1. Click "Editar"
2. Toggle "Activo" → No
3. Guardar

**Resultado:** Badge cambia a "Inactivo" (gris)

---

## 🎨 Características Especiales a Demostrar

### Dark Mode
1. Click en icono sol/luna (top bar)
2. Verificar cambio inmediato en toda la aplicación
3. Reload página → tema persiste

### Responsive Design
**Desktop → Mobile:**
1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Seleccionar iPhone 12 Pro
4. Verificar:
   - Sidebar se convierte en hamburguesa
   - Tablas scrollean horizontalmente
   - Botones tamaño touch-friendly
   - Gráficos se adaptan

### Validación en Tiempo Real
1. Crear nuevo formulario
2. Dejar campo "Destino" vacío
3. Click fuera del campo
4. Ver mensaje de error en español
5. Llenar campo → error desaparece

### Firma Digital (Touch)
**En dispositivo táctil:**
1. Crear formulario en tablet/phone
2. Usar dedo para dibujar firma
3. Verificar trazo suave
4. Guardar y verificar que se almacena

---

## 🔐 Pruebas de Seguridad

### Test 1: Acceso No Autorizado
1. Logout
2. Intentar acceder directamente a: http://localhost:3000/products
3. **Resultado esperado:** Redirige a login

### Test 2: Permisos por Rol
**Como Operador:**
1. Login con `operador@temp.com` / `Oper123!`
2. Intentar acceder a "Productos" (sidebar)
3. **Resultado esperado:** Opción no visible o acceso denegado

**Como Supervisor:**
1. Login con `supervisor@temp.com` / `Super123!`
2. Verificar que puede revisar formularios
3. Intentar eliminar formulario
4. **Resultado esperado:** Puede revisar pero no eliminar

---

## 📊 Backend API Testing (Swagger)

### Acceder a Swagger
**URL:** http://localhost:5000/swagger

### Test Flow:

#### 1. Autenticación
```json
POST /api/auth/login
{
  "email": "admin@temp.com",
  "password": "Admin123!"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "xyz123...",
    "user": {
      "id": "guid",
      "name": "Admin",
      "email": "admin@temp.com",
      "role": "Administrator"
    }
  }
}
```

**Copiar token** → Click "Authorize" → Pegar `Bearer {token}`

#### 2. Obtener Formularios
```http
GET /api/temperatureforms?page=1&pageSize=10
```

**Verificar respuesta incluye:**
- Lista de formularios
- Paginación
- Datos de usuarios relacionados
- Registros de temperatura

#### 3. Crear Formulario via API
```json
POST /api/temperatureforms
{
  "destination": "API Test",
  "defrostDate": "2024-01-15T08:00:00",
  "productionDate": "2024-01-15T14:00:00",
  "temperatureRecords": [
    {
      "carNumber": 99,
      "productCode": "160",
      "productTemperature": -18,
      "defrostStartTime": "08:00:00",
      "consumptionStartTime": "10:00:00",
      "consumptionEndTime": "12:00:00",
      "observations": "Test via API"
    }
  ]
}
```

**Verificar:**
- Status 200/201
- Formulario creado
- FormNumber auto-generado (formato TEMP-YYYYMMDD-XXXX)

#### 4. Estadísticas
```http
GET /api/reports/statistics?startDate=2024-01-01&endDate=2024-01-31
```

**Verificar respuesta:**
- Total de formularios
- Desglose por estado
- Alertas
- Temperaturas promedio

---

## 🗄️ Database Inspection

### SQL Server
```bash
# Conectar a la base de datos
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P TempControl2024!
```

```sql
-- Ver usuarios
SELECT Id, Name, Email, Role FROM TemperatureControlDB.dbo.Users;
GO

-- Ver productos
SELECT ProductCode, ProductName, MinTemperature, MaxTemperature
FROM TemperatureControlDB.dbo.Products;
GO

-- Ver formularios con conteo de registros
SELECT
    f.FormNumber,
    f.Destination,
    f.Status,
    COUNT(r.Id) as TotalRecords,
    f.CreatedAt
FROM TemperatureControlDB.dbo.TemperatureForms f
LEFT JOIN TemperatureControlDB.dbo.TemperatureRecords r ON f.Id = r.FormId
GROUP BY f.FormNumber, f.Destination, f.Status, f.CreatedAt
ORDER BY f.CreatedAt DESC;
GO

-- Ver alertas generadas
SELECT
    a.Message,
    a.Severity,
    a.Temperature,
    f.FormNumber
FROM TemperatureControlDB.dbo.TemperatureAlerts a
JOIN TemperatureControlDB.dbo.TemperatureForms f ON a.FormId = f.Id;
GO

-- Salir
EXIT
```

### Redis Cache
```bash
# Conectar a Redis
docker-compose exec redis redis-cli

# Ver todas las keys
KEYS *

# Ver un valor
GET "cached_key_name"

# Ver TTL
TTL "cached_key_name"

# Salir
exit
```

---

## 📈 Performance Testing

### Load Test Simple
```bash
# Usando curl (Windows PowerShell)
# Test de 100 requests
1..100 | ForEach-Object {
    curl http://localhost:5000/health
}

# Verificar que todos responden 200
```

### Frontend Performance
1. Abrir DevTools (F12)
2. Tab "Lighthouse"
3. Click "Generate report"
4. **Verificar scores:**
   - Performance: > 85
   - Accessibility: > 95
   - Best Practices: > 90

---

## 🐛 Edge Cases to Test

### 1. Formulario con Muchos Registros
1. Crear formulario
2. Agregar 20+ registros
3. Verificar rendimiento al guardar
4. Verificar que se muestran todos en detalle

### 2. Temperaturas Extremas
1. Ingresar temperatura: `-30` °C (muy baja)
2. Verificar alerta "Emergency"
3. Ingresar temperatura: `-5` °C (muy alta)
4. Verificar alerta "Critical"

### 3. Caracteres Especiales
1. Destino: `Planta #1 - Área 'Especial' & "Demo"`
2. Observaciones: `Émojis: 🌡️ ❄️ ✅ - Símbolos: °C ±2`
3. Guardar y verificar que se mantienen correctamente

### 4. Sesión Expirada
1. Login
2. Esperar 60+ minutos (o modificar JWT expiration a 1 min en backend)
3. Intentar acción
4. Verificar redirect a login o refresh automático

---

## 📋 Demo Script (Para Presentación)

### Introducción (2 min)
> "Sistema moderno de control de temperaturas que digitaliza el proceso manual en papel.
> Stack: .NET 8 backend, Next.js 14 frontend, SQL Server, Docker.
> Características: Autenticación JWT, RBAC, tiempo real, responsive, dark mode, firmas digitales."

### Dashboard (3 min)
1. Mostrar estadísticas en tiempo real
2. Explicar gráfico de tendencias
3. Mostrar actividad reciente
4. Cambiar tema dark/light

### Crear Formulario (5 min)
1. Wizard paso a paso
2. Agregar 3 registros (uno con alerta)
3. Capturar firma digital
4. Enviar para revisión

### Revisar como Supervisor (3 min)
1. Cambiar de usuario
2. Ver detalles del formulario
3. Aprobar con firma

### Reportes (3 min)
1. Mostrar estadísticas
2. Filtros y gráficos
3. Exportar PDF
4. Exportar Excel

### Backend API (2 min)
1. Abrir Swagger
2. Mostrar endpoints documentados
3. Ejecutar un GET

### Mobile Responsive (2 min)
1. DevTools → Mobile view
2. Navegar en móvil
3. Crear formulario en mobile

### Cierre (1 min)
> "Sistema production-ready con 102 archivos, 14K líneas de código,
> zero placeholders, Docker deployment, CI/CD pipelines, y documentación completa."

**Total: ~20 minutos**

---

## ✅ Checklist Pre-Demo

### Antes de la Demostración
- [ ] Docker Desktop corriendo
- [ ] `docker-compose up -d` ejecutado
- [ ] Todos los servicios "healthy"
- [ ] http://localhost:3000 accesible
- [ ] http://localhost:5000/swagger accesible
- [ ] Navegador en pantalla completa
- [ ] DevTools cerrado (abrir cuando sea necesario)
- [ ] Datos seed cargados (verificar login funciona)

### Durante la Demostración
- [ ] Cerrar pestañas innecesarias
- [ ] Aumentar zoom si audiencia grande (Ctrl + +)
- [ ] Tener credenciales a mano
- [ ] Preparar datos de prueba
- [ ] Tener backup de archivos exportados

### Después de la Demostración
- [ ] Guardar formularios demo creados (si es necesario)
- [ ] `docker-compose down` (opcional)
- [ ] Backup de database (si datos importantes)

---

## 🆘 Troubleshooting Durante Demo

### Problema: Servicio no inicia
```bash
docker-compose logs [servicio]
docker-compose restart [servicio]
```

### Problema: Login no funciona
- Verificar datos seed cargaron: `docker-compose logs backend | grep "Seeding"`
- Reiniciar backend: `docker-compose restart backend`

### Problema: Frontend no conecta con backend
- Verificar URL en `.env.local`
- Verificar CORS en backend
- Hard refresh navegador: Ctrl+Shift+R

### Problema: Cambios no se ven
- Hard refresh: Ctrl+F5
- Limpiar localStorage: DevTools → Application → Storage → Clear

---

## 📞 Contacto y Soporte

**Repositorio:** https://github.com/tu-usuario/temperature-control-system
**Documentación:** Ver `/docs/`
**Issues:** GitHub Issues

---

**¡Éxito en tu demo! 🎉**
