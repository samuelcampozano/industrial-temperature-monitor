# Temperature Control API Documentation

## Overview

The Temperature Control API provides endpoints for managing temperature control forms, products, users, and reports for a food processing facility.

## Base URL

- Development: `http://localhost:5000`
- Production: `https://your-production-domain.com`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login Endpoint

**POST** `/api/auth/login`

Request:
```json
{
  "email": "admin@temp.com",
  "password": "Admin123!"
}
```

Response:
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "base64-encoded-refresh-token",
    "expiresAt": "2024-01-15T10:30:00Z",
    "user": {
      "id": "guid",
      "name": "Administrador del Sistema",
      "email": "admin@temp.com",
      "role": "Administrator"
    }
  }
}
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh-token` | Refresh JWT token | No |

### Temperature Forms

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/temperatureforms` | Get all forms (paginated) | Yes | All |
| GET | `/api/temperatureforms/{id}` | Get form by ID | Yes | All |
| POST | `/api/temperatureforms` | Create new form | Yes | Operator, Supervisor, Admin |
| PUT | `/api/temperatureforms/{id}` | Update form | Yes | Operator, Supervisor, Admin |
| PATCH | `/api/temperatureforms/{id}/review` | Review/approve form | Yes | Supervisor, Admin |
| DELETE | `/api/temperatureforms/{id}` | Delete form | Yes | Admin |

#### Get All Forms (with filters)

**GET** `/api/temperatureforms?page=1&pageSize=20&status=Completed&startDate=2024-01-01&endDate=2024-01-31`

Query Parameters:
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (Draft, Completed, Reviewed, Rejected, Archived)
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)
- `destination` (optional): Filter by destination (partial match)
- `createdByUserId` (optional): Filter by creator user ID

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "guid",
        "formNumber": "TEMP-20240115-0001",
        "destination": "Planta de Conservas Central",
        "defrostDate": "2024-01-14T00:00:00Z",
        "productionDate": "2024-01-15T00:00:00Z",
        "status": "Reviewed",
        "createdByUserId": "guid",
        "createdByUserName": "Operador de Planta",
        "reviewedByUserId": "guid",
        "reviewedByUserName": "Supervisor Principal",
        "reviewedAt": "2024-01-15T10:00:00Z",
        "reviewNotes": "Todo conforme",
        "observations": "Proceso normal",
        "createdAt": "2024-01-15T08:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z",
        "temperatureRecords": [
          {
            "id": "guid",
            "carNumber": 1,
            "productCode": "160",
            "productName": "Producto Congelado 160",
            "defrostStartTime": "08:00:00",
            "productTemperature": -18.5,
            "consumptionStartTime": "10:30:00",
            "consumptionEndTime": "14:00:00",
            "hasAlert": false,
            "defrostDurationMinutes": 150,
            "consumptionDurationMinutes": 210
          }
        ],
        "alertCount": 0
      }
    ],
    "totalCount": 50,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

#### Create Form

**POST** `/api/temperatureforms`

Request:
```json
{
  "destination": "Planta de Conservas Central",
  "defrostDate": "2024-01-15T00:00:00Z",
  "productionDate": "2024-01-16T00:00:00Z",
  "observations": "Primera producción del día",
  "geoLocation": "{\"lat\": 40.7128, \"lng\": -74.0060}"
}
```

#### Update Form

**PUT** `/api/temperatureforms/{id}`

Request:
```json
{
  "destination": "Planta de Conservas Norte",
  "defrostDate": "2024-01-15T00:00:00Z",
  "productionDate": "2024-01-16T00:00:00Z",
  "status": "Completed",
  "observations": "Actualizado con observaciones finales",
  "createdBySignature": "base64-encoded-signature-image"
}
```

#### Review Form

**PATCH** `/api/temperatureforms/{id}/review`

Request:
```json
{
  "status": "Reviewed",
  "reviewNotes": "Aprobado sin observaciones",
  "reviewedBySignature": "base64-encoded-signature-image"
}
```

### Products

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/products` | Get all products | Yes | All |
| GET | `/api/products/{id}` | Get product by ID | Yes | All |
| GET | `/api/products/code/{code}` | Get product by code | Yes | All |
| POST | `/api/products` | Create product | Yes | Admin |
| PUT | `/api/products/{id}` | Update product | Yes | Admin |
| DELETE | `/api/products/{id}` | Delete product | Yes | Admin |

#### Get All Products

**GET** `/api/products?isActive=true`

Query Parameters:
- `isActive` (optional): Filter by active status

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "productCode": "160",
      "productName": "Producto Congelado 160",
      "minTemperature": -25.0,
      "maxTemperature": -10.0,
      "maxDefrostTimeMinutes": 120,
      "description": "Producto premium para conservas",
      "category": "Congelados Premium",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": null
    }
  ]
}
```

#### Create Product

**POST** `/api/products`

Request:
```json
{
  "productCode": "404",
  "productName": "Nuevo Producto Congelado",
  "minTemperature": -25.0,
  "maxTemperature": -12.0,
  "maxDefrostTimeMinutes": 100,
  "description": "Descripción del producto",
  "category": "Congelados Premium"
}
```

#### Update Product

**PUT** `/api/products/{id}`

Request:
```json
{
  "productName": "Producto Actualizado",
  "minTemperature": -24.0,
  "maxTemperature": -11.0,
  "isActive": true
}
```

### Reports

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/reports/daily` | Get daily report | Yes | All |
| GET | `/api/reports/statistics` | Get dashboard statistics | Yes | All |
| GET | `/api/reports/export/{id}/pdf` | Export form to PDF | Yes | All |

#### Get Daily Report

**GET** `/api/reports/daily?date=2024-01-15`

Query Parameters:
- `date` (optional): Report date (default: today)

Response:
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15T00:00:00Z",
    "totalForms": 15,
    "draftForms": 3,
    "completedForms": 5,
    "reviewedForms": 6,
    "rejectedForms": 1,
    "totalRecords": 45,
    "recordsWithAlerts": 2,
    "totalAlerts": 3,
    "criticalAlerts": 1,
    "emergencyAlerts": 0,
    "formsByUser": [
      {
        "userId": "guid",
        "userName": "Operador de Planta",
        "totalForms": 8,
        "draftForms": 2,
        "completedForms": 3,
        "reviewedForms": 3,
        "rejectedForms": 0
      }
    ],
    "productUsage": [
      {
        "productCode": "160",
        "productName": "Producto Congelado 160",
        "totalRecords": 20,
        "recordsWithAlerts": 1,
        "averageTemperature": -18.5,
        "minTemperature": -22.0,
        "maxTemperature": -15.0
      }
    ],
    "generatedAt": "2024-01-15T15:30:00Z"
  }
}
```

#### Get Dashboard Statistics

**GET** `/api/reports/statistics?startDate=2024-01-01&endDate=2024-01-31`

Query Parameters:
- `startDate` (optional): Period start date (default: 30 days ago)
- `endDate` (optional): Period end date (default: today)

Response:
```json
{
  "success": true,
  "data": {
    "totalForms": 150,
    "pendingReview": 12,
    "totalRecords": 450,
    "totalAlerts": 25,
    "criticalAlerts": 5,
    "averageRecordsPerForm": 3.0,
    "alertRate": 16.67,
    "formsByStatus": [
      { "status": "Draft", "count": 10 },
      { "status": "Completed", "count": 12 },
      { "status": "Reviewed", "count": 120 },
      { "status": "Rejected", "count": 8 }
    ],
    "formsByDay": [
      { "date": "2024-01-01T00:00:00Z", "count": 5 },
      { "date": "2024-01-02T00:00:00Z", "count": 7 }
    ],
    "alertsByDay": [
      { "date": "2024-01-01T00:00:00Z", "count": 2 },
      { "date": "2024-01-02T00:00:00Z", "count": 1 }
    ],
    "topProducts": [
      { "productCode": "160", "count": 80 },
      { "productCode": "101", "count": 65 }
    ],
    "dateRange": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    }
  }
}
```

#### Export Form to PDF

**GET** `/api/reports/export/{id}/pdf`

Returns a PDF file with the complete form data, including:
- Form header with number, destination, dates, status
- Creator and reviewer information
- Temperature records table
- Alerts (if any)
- General observations
- Signatures (if available)

Response: `application/pdf` file download

## User Roles

### Administrator
- Full access to all endpoints
- Can manage users, products, and forms
- Can delete any resource

### Supervisor
- Can review and approve/reject forms
- Can create and edit forms
- Can view all reports
- Cannot manage products or users

### Operator
- Can create and edit own forms
- Can view forms and reports
- Cannot review forms or manage products

### Auditor
- Read-only access to forms and reports
- Cannot create, edit, or delete any resource

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Data Types

### FormStatus Enum
- `Draft` (0): Form is being filled out
- `Completed` (1): Form is complete, pending review
- `Reviewed` (2): Form has been approved
- `Rejected` (3): Form was rejected, needs correction
- `Archived` (4): Form is archived

### UserRole Enum
- `Operator` (0): Can create and edit forms
- `Supervisor` (1): Can review and approve forms
- `Administrator` (2): Full system access
- `Auditor` (3): Read-only access

### AlertSeverity Enum
- `Info` (0): Informational
- `Warning` (1): Warning, near limits
- `Critical` (2): Temperature out of range
- `Emergency` (3): Severe temperature deviation

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

When rate limit is exceeded, the API returns `429 Too Many Requests`.

## Pagination

All list endpoints support pagination with these query parameters:
- `page`: Page number (starting from 1)
- `pageSize`: Items per page (max 100)

Paginated responses include:
- `items`: Array of results
- `totalCount`: Total number of items
- `page`: Current page number
- `pageSize`: Items per page
- `totalPages`: Total number of pages
- `hasPreviousPage`: Boolean
- `hasNextPage`: Boolean

## Date/Time Format

All dates and times are in ISO 8601 format (UTC):
- Date: `2024-01-15`
- DateTime: `2024-01-15T10:30:00Z`
- Time: `10:30:00`

## Sample Workflow

### Creating and Reviewing a Temperature Form

1. **Login**
   ```bash
   POST /api/auth/login
   Body: { "email": "operador@temp.com", "password": "Oper123!" }
   ```

2. **Create Form**
   ```bash
   POST /api/temperatureforms
   Headers: { "Authorization": "Bearer <token>" }
   Body: { "destination": "Plant A", ... }
   ```

3. **Add Temperature Records** (through UI or separate endpoint)

4. **Complete Form**
   ```bash
   PUT /api/temperatureforms/{id}
   Body: { "status": "Completed", "createdBySignature": "..." }
   ```

5. **Supervisor Reviews** (as supervisor)
   ```bash
   PATCH /api/temperatureforms/{id}/review
   Headers: { "Authorization": "Bearer <supervisor-token>" }
   Body: { "status": "Reviewed", "reviewNotes": "Approved" }
   ```

6. **Export to PDF**
   ```bash
   GET /api/reports/export/{id}/pdf
   ```

## Support

For API support:
- Check Swagger documentation at `/swagger`
- Review logs for detailed error information
- Contact system administrator
