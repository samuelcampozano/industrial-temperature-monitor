# Sistema de Control de Temperatura - Frontend

Frontend de Next.js 14 para el Sistema de Control de Temperatura de Asiservis.

## Características

- ✅ **Next.js 14** con App Router
- ✅ **TypeScript** para type safety completo
- ✅ **Tailwind CSS** para estilos
- ✅ **shadcn/ui** componentes UI modernos
- ✅ **Zustand** para state management
- ✅ **React Hook Form + Zod** para validación de formularios
- ✅ **Recharts** para visualización de datos
- ✅ **Axios** para peticiones HTTP
- ✅ **Dark Mode** con next-themes
- ✅ **Responsive Design** para móviles y tablets
- ✅ **PWA Ready** con manifest

## Estructura del Proyecto

```
src/
├── app/                          # App Router pages
│   ├── (auth)/                   # Auth pages (login)
│   ├── (dashboard)/              # Dashboard pages
│   │   ├── dashboard/            # Main dashboard
│   │   ├── forms/                # Forms management
│   │   ├── reports/              # Reports & statistics
│   │   └── products/             # Products management
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Layout components (Sidebar, TopBar)
│   ├── forms/                    # Form-specific components
│   ├── dashboard/                # Dashboard components
│   └── providers/                # Context providers
├── lib/
│   ├── api/                      # API client & endpoints
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utility functions
├── stores/                       # Zustand stores
│   ├── authStore.ts              # Authentication state
│   └── formsStore.ts             # Forms state
├── hooks/                        # Custom React hooks
└── middleware.ts                 # Next.js middleware
```

## Instalación

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**

Copia `.env.example` a `.env.local` y configura:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. **Ejecutar en desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm test` - Ejecuta los tests
- `npm run test:watch` - Ejecuta tests en modo watch
- `npm run test:e2e` - Ejecuta tests e2e con Playwright

## Páginas y Funcionalidades

### 🔐 Autenticación (`/login`)

- Login con email y password
- Validación de formularios con Zod
- Manejo de sesión con JWT
- Refresh token automático

### 📊 Dashboard (`/dashboard`)

- Estadísticas generales del sistema
- Gráficos de tendencias de temperatura
- Actividad reciente
- Cards con métricas clave

### 📝 Formularios (`/forms`)

- **Lista de formularios** con filtros y paginación
- **Crear nuevo formulario** con wizard multi-paso
- **Ver/Editar formulario** con gestión de registros
- **Firma digital** con canvas
- **Enviar para revisión** (operarios)
- **Aprobar/Rechazar** (supervisores)
- Alertas de temperatura fuera de rango

### 📈 Reportes (`/reports`)

- Filtros por rango de fechas y productos
- Estadísticas diarias
- Gráficos de temperatura por producto
- Distribución de registros
- **Exportar a PDF**
- **Exportar a Excel**
- Vista de impresión

### 📦 Productos (`/products`)

- CRUD completo de productos
- Gestión de rangos de temperatura
- Códigos de barras
- Activar/Desactivar productos
- Solo accesible para ADMIN

## Roles y Permisos

### OPERARIO
- ✅ Ver dashboard
- ✅ Crear formularios
- ✅ Editar formularios propios (estado DRAFT)
- ✅ Agregar registros de temperatura
- ✅ Enviar formularios para revisión

### SUPERVISOR
- ✅ Todo lo de OPERARIO
- ✅ Ver todos los formularios
- ✅ Revisar y aprobar/rechazar formularios
- ✅ Acceso a reportes

### ADMIN
- ✅ Todo lo de SUPERVISOR
- ✅ Gestionar productos
- ✅ Gestionar usuarios (si se implementa)

## State Management

### Auth Store (`authStore.ts`)

Maneja la autenticación del usuario:

```typescript
- user: User | null
- token: string | null
- isAuthenticated: boolean
- login(credentials)
- logout()
- refreshToken()
```

### Forms Store (`formsStore.ts`)

Maneja los formularios y registros:

```typescript
- forms: TemperatureControlForm[]
- currentForm: TemperatureControlForm | null
- fetchForms(filters, pagination)
- createForm(data)
- updateForm(id, data)
- submitForm(id, signature)
- reviewForm(id, data)
- addRecord(formId, data)
```

## API Integration

Todas las llamadas a la API están centralizadas en `lib/api/endpoints.ts`:

```typescript
// Autenticación
authApi.login(credentials)
authApi.logout()
authApi.refreshToken()

// Formularios
formsApi.getAll(filters, pagination)
formsApi.getById(id)
formsApi.create(data)
formsApi.submit(id, signature)
formsApi.review(id, data)

// Productos
productsApi.getAll()
productsApi.create(data)
productsApi.update(id, data)

// Reportes
reportsApi.getDailyReport(date)
reportsApi.getStatistics(filters)
reportsApi.exportPdf(filters)
reportsApi.exportExcel(filters)
```

## Componentes UI

### shadcn/ui Components

- `Button` - Botones con variantes
- `Input` - Campos de texto
- `Select` - Dropdowns
- `Dialog` - Modales
- `Card` - Tarjetas
- `Table` - Tablas de datos
- `Tabs` - Pestañas
- `Toast` - Notificaciones
- `Label` - Etiquetas de formulario

### Custom Components

- **StatsCard** - Tarjeta de estadísticas
- **TemperatureChart** - Gráfico de líneas con Recharts
- **RecentActivity** - Feed de actividad
- **TemperatureRecordRow** - Fila editable de registro
- **SignatureCapture** - Canvas para firma digital
- **Sidebar** - Navegación lateral
- **TopBar** - Barra superior

## Utilidades

### Formatters (`lib/utils.ts`)

```typescript
formatDate(date, format) // Formatear fechas en español
formatTemperature(temp) // Formatear temperatura con °C
formatRelativeTime(date) // "hace 2 horas"
formatNumber(num, decimals) // Formatear números
```

### Status Helpers

```typescript
getFormStatusLabel(status) // Label en español
getFormStatusColor(status) // Clases de Tailwind
getAlertSeverityLabel(severity)
getAlertSeverityColor(severity)
```

## Estilos y Temas

### Tailwind CSS

Configuración completa con:
- Variables CSS para temas
- Dark mode
- Colores personalizados para charts
- Scrollbar customizado
- Animaciones

### Dark Mode

Implementado con `next-themes`:

```tsx
import { useTheme } from "next-themes"

const { theme, setTheme } = useTheme()
setTheme('dark') // o 'light'
```

## Mobile Responsive

- Diseño responsive con Tailwind breakpoints
- Sidebar colapsable en móvil
- Tablas con scroll horizontal
- Touch-friendly para firma digital

## PWA Support

- Manifest configurado
- Service Worker ready
- Icons para iOS y Android
- Instalable como app nativa

## Seguridad

- ✅ JWT token management
- ✅ Refresh token automático
- ✅ Protected routes con middleware
- ✅ Role-based access control
- ✅ XSS protection
- ✅ CSRF protection

## Build y Deploy

### Build para producción:

```bash
npm run build
```

### Deploy en Vercel:

```bash
vercel --prod
```

### Variables de entorno en producción:

```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
```

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
npm test
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

## Troubleshooting

### Error de CORS

Asegúrate de que el backend tenga configurado CORS correctamente:

```typescript
// En el backend
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

### Token expirado

El sistema maneja automáticamente el refresh del token. Si hay problemas, verifica:

1. Que el backend devuelve `refreshToken`
2. Que el endpoint `/api/auth/refresh` funciona
3. Que las cookies se guardan correctamente

### Problemas con firma digital

Si la firma no se guarda:

1. Verifica permisos de canvas
2. Asegúrate de que se llama `saveSignature()`
3. Revisa la consola para errores de conversión a base64

## Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y pertenece a Asiservis.

## Soporte

Para soporte técnico, contacta al equipo de desarrollo.
