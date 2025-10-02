# 🧪 Testing Guide - Sistema de Control de Temperaturas

## ✅ System Status

All services are running and connected:

| Service | Status | Port | Container Name |
|---------|--------|------|----------------|
| Frontend | ✅ Running | 3000 | temperaturecontrol-frontend |
| Backend API | ✅ Running | 5000 | temperaturecontrol-api |
| SQL Server | ✅ Running | 1433 | temperaturecontrol-sqlserver |
| Redis | ✅ Running | 6379 | temperaturecontrol-redis |

---

## 🔧 Recent Fixes Applied

### 1. **Login Redirect Issue** ✅ FIXED
- **Problem**: After successful login, page stayed on login screen
- **Solution**: Added `window.location.href` redirect with 500ms delay
- **File**: `frontend/src/app/(auth)/login/page.tsx`

### 2. **Middleware Authentication** ✅ FIXED
- **Problem**: Middleware was checking for cookies, but auth uses localStorage
- **Solution**: Simplified middleware for client-side auth handling
- **File**: `frontend/src/middleware.ts`

### 3. **Missing Icon Files** ✅ FIXED
- **Problem**: 404 errors for `/icons/icon-192x192.png` and `/icons/icon-512x512.png`
- **Solution**: Created SVG placeholders and updated manifest
- **Files**: 
  - `frontend/public/icons/icon-192x192.svg`
  - `frontend/public/icons/icon-512x512.svg`
  - `frontend/public/manifest.json`

### 4. **Metadata Warnings** ✅ FIXED
- **Problem**: Next.js 15 warnings about `themeColor` and `viewport` in metadata
- **Solution**: Moved to separate `viewport` export in layout.tsx
- **File**: `frontend/src/app/layout.tsx`

---

## 🚀 How to Test the Application

### Step 1: Access the Application
Open your browser and go to: **http://localhost:3000**

### Step 2: Login
Use any of these test accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@temp.com | SecurePass123! |
| **Supervisor** | supervisor@temp.com | SecurePass123! |
| **Operador** | operador@temp.com | SecurePass123! |
| **Auditor** | auditor@temp.com | Audit123! |

**Expected Result**: After clicking "Iniciar sesión", you should see:
1. Toast message: "¡Bienvenido! Has iniciado sesión exitosamente"
2. Automatic redirect to `/dashboard` after 0.5 seconds

---

## 📋 Test Scenarios

### Test 1: Dashboard Overview
**URL**: http://localhost:3000/dashboard

**What to check:**
- ✅ 4 statistics cards showing:
  - Total Formularios
  - Formularios Revisados
  - Alertas Activas
  - Total Productos
- ✅ Temperature trends chart
- ✅ Recent activity list
- ✅ Sidebar navigation working

**Expected Data**: You should see seed data from the database (3 forms, 6 products, etc.)

---

### Test 2: View Forms List
**URL**: http://localhost:3000/forms

**What to check:**
- ✅ Table with existing temperature forms
- ✅ Status badges (Draft, Completed, Reviewed, etc.)
- ✅ Search and filter functionality
- ✅ "Crear Nuevo Formulario" button (top right)
- ✅ Action buttons (View, Edit, Delete)

**Test Actions:**
1. Click on "Ver" (eye icon) → Should open form details
2. Try filtering by status
3. Try searching by form number

---

### Test 3: Create New Form
**Click**: "Crear Nuevo Formulario" button

**What to test:**
1. **Step 1 - Basic Information**:
   - Fill in "Destino" (e.g., "Planta Principal")
   - Select "Fecha de Descongelación"
   - Select "Fecha de Producción"
   - Click "Siguiente"

2. **Step 2 - Temperature Records**:
   - Click "Agregar Registro"
   - Select a product from dropdown
   - Enter temperature (e.g., 4.5)
   - Enter observation
   - Click "Guardar Registro"
   - Add multiple records if needed
   - Click "Siguiente"

3. **Step 3 - Signatures**:
   - Draw signature in "Realizado por" canvas
   - Add observations if needed
   - Click "Enviar Formulario"

**Expected Result**: 
- Toast: "Formulario creado exitosamente"
- Redirect to forms list
- New form appears in the table

---

### Test 4: Products Management (Admin only)
**URL**: http://localhost:3000/products

**What to check:**
- ✅ List of products with codes and temperature ranges
- ✅ "Crear Producto" button (for admins)
- ✅ Edit and Delete actions

**Test Actions:**
1. Click "Crear Producto"
2. Fill in:
   - Name: "Producto Test"
   - Code: "TEST-001"
   - Min Temperature: 0
   - Max Temperature: 5
   - Description: "Producto de prueba"
3. Click "Guardar"

**Expected Result**:
- Toast: "Producto creado exitosamente"
- New product appears in list

---

### Test 5: Reports & Export
**URL**: http://localhost:3000/reports

**What to test:**
1. **Date Range Filter**:
   - Select start date
   - Select end date
   - Click "Aplicar Filtros"

2. **Product Filter**:
   - Select specific product
   - View filtered results

3. **Export Options**:
   - Click "Exportar PDF" → Should download PDF report
   - Click "Exportar Excel" → Should download Excel file

**Expected Result**:
- Statistics update based on filters
- Charts reflect filtered data
- Export files download successfully

---

### Test 6: Review Form (Supervisor/Admin only)
**Steps:**
1. Go to forms list
2. Find a form with status "Completed"
3. Click "Revisar" button
4. In modal:
   - Select "Aprobar" or "Rechazar"
   - Add review notes
   - Draw signature
   - Click "Enviar Revisión"

**Expected Result**:
- Toast: "Formulario revisado exitosamente"
- Form status changes to "Reviewed" or "Rejected"
- Review notes saved

---

### Test 7: Temperature Alerts
**How to trigger:**
1. Create a form with temperature record OUTSIDE product's range
2. Example: If product range is 0-5°C, enter 10°C
3. Submit the form

**Expected Result**:
- Alert should be created automatically
- Alert appears in dashboard "Alertas Activas"
- Alert severity based on deviation level

---

### Test 8: Dark Mode Toggle
**Steps:**
1. Look for theme toggle button (usually in TopBar)
2. Click to switch between light/dark mode
3. Check that all components adapt

**Expected Result**:
- Smooth transition between themes
- All text readable
- Colors inverted appropriately

---

### Test 9: Logout
**Steps:**
1. Click user menu (top right)
2. Click "Cerrar Sesión"

**Expected Result**:
- Redirect to `/login`
- Token removed from localStorage
- Can't access `/dashboard` without logging in again

---

## 🐛 Common Issues & Solutions

### Issue 1: "Page not loading" or "Blank screen"
**Solution:**
```powershell
# Restart frontend container
docker restart temperaturecontrol-frontend

# Check logs
docker logs temperaturecontrol-frontend --tail 50
```

### Issue 2: "API connection error"
**Solution:**
```powershell
# Check if backend is healthy
curl http://localhost:5000/health

# Restart backend if needed
docker restart temperaturecontrol-api
```

### Issue 3: "Can't login" or "401 Unauthorized"
**Solution:**
1. Check backend logs: `docker logs temperaturecontrol-api --tail 100`
2. Verify database connection
3. Ensure seed data was loaded

### Issue 4: "Stuck on login page after successful login"
**Solution:**
1. Clear browser cache and localStorage:
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Storage
   - Refresh page
2. Try logging in again

---

## 📊 Expected Console Output (Normal)

When the app is working correctly, you should see in browser console:

```
✓ Compiled /middleware in 2.3s
✓ Compiled /login in 31s
✓ Ready in 29.7s
GET /dashboard 200 in 150ms
```

**Warnings are OK** (non-critical):
- `npm warn deprecated glob@7.2.3` → Old dependency warning
- Telemetry messages → Can be ignored

---

## 🔍 API Endpoints to Test Manually

### Health Check
```powershell
curl http://localhost:5000/health
```

### Login
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@temp.com","password":"SecurePass123!"}'
```

### Get Forms (requires token)
```powershell
$token = "YOUR_TOKEN_HERE"
curl http://localhost:5000/api/forms `
  -H "Authorization: Bearer $token"
```

### Swagger Documentation
Open: http://localhost:5000/swagger

---

## 📝 Test Checklist

Use this checklist to verify all functionality:

- [ ] ✅ Login with all 4 user roles
- [ ] ✅ Dashboard loads with statistics
- [ ] ✅ View forms list
- [ ] ✅ Create new form (all 3 steps)
- [ ] ✅ View form details
- [ ] ✅ Edit draft form
- [ ] ✅ Delete form
- [ ] ✅ Submit form for review
- [ ] ✅ Review form (approve/reject)
- [ ] ✅ View products list
- [ ] ✅ Create new product (admin)
- [ ] ✅ Edit product (admin)
- [ ] ✅ Generate reports
- [ ] ✅ Export to PDF
- [ ] ✅ Export to Excel
- [ ] ✅ Filter by date range
- [ ] ✅ Filter by product
- [ ] ✅ Dark mode toggle
- [ ] ✅ Logout
- [ ] ✅ Temperature alerts triggered
- [ ] ✅ Responsive design (resize browser)

---

## 🎯 Next Steps After Testing

### If Everything Works:
1. Document any bugs found
2. Test on different browsers (Chrome, Firefox, Edge)
3. Test on mobile devices
4. Prepare for production deployment

### If Issues Found:
1. Check Docker logs for all services
2. Verify database has seed data
3. Clear browser cache
4. Restart containers if needed

---

## 📞 Quick Commands Reference

```powershell
# Check all containers
docker ps

# Restart frontend
docker restart temperaturecontrol-frontend

# Restart backend  
docker restart temperaturecontrol-api

# View frontend logs
docker logs temperaturecontrol-frontend -f

# View backend logs
docker logs temperaturecontrol-api -f

# Stop all
docker-compose down

# Start all
docker-compose up -d

# Access frontend
http://localhost:3000

# Access backend API docs
http://localhost:5000/swagger
```

---

## ✨ Success Indicators

You'll know everything is working when:
- ✅ Login redirects to dashboard automatically
- ✅ No 404 errors in browser console
- ✅ All images and icons load
- ✅ Forms can be created and submitted
- ✅ Data persists after refresh
- ✅ Logout works and clears session

---

**Happy Testing! 🚀**
