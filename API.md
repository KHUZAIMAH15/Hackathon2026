# API Documentation

Hospital Management System API - Complete documentation available at `/api-docs` when running the server.

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new patient | Public |
| POST | `/login` | Login user | Public |
| POST | `/logout` | Logout user | Private |
| GET | `/me` | Get current user | Private |
| PUT | `/password` | Update password | Private |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password/:token` | Reset password | Public |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Get dashboard stats | Admin |
| POST | `/doctors` | Create doctor | Admin |
| GET | `/doctors` | List doctors | Admin |
| DELETE | `/doctors/:id` | Delete doctor | Admin |
| GET | `/patients` | List patients | Admin |
| POST | `/receptionists` | Create receptionist | Admin |
| DELETE | `/receptionists/:id` | Delete receptionist | Admin |
| GET | `/users` | List all users | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

### Doctor (`/api/doctor`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get doctor profile | Doctor |
| PUT | `/profile` | Update profile | Doctor |
| GET | `/appointments` | Get appointments | Doctor |
| PUT | `/appointments/:id/status` | Update status | Doctor |
| POST | `/prescriptions` | Add prescription | Doctor |

### Receptionist (`/api/receptionist`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/patients` | Register patient | Receptionist |
| GET | `/patients` | List patients | Receptionist |
| POST | `/appointments` | Book appointment | Receptionist |
| GET | `/appointments` | List appointments | Receptionist |
| PUT | `/appointments/:id/cancel` | Cancel appointment | Receptionist |

### Patient (`/api/patient`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get patient profile | Patient |
| PUT | `/profile` | Update profile | Patient |
| GET | `/appointments` | Get appointments | Patient |
| GET | `/prescriptions` | Get prescriptions | Patient |

## Request/Response Examples

### Register Patient
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65c1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    }
  }
}
```

### Book Appointment
```bash
POST /api/receptionist/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "65c1234567890abcdef12345",
  "doctorId": "65c1234567890abcdef67890",
  "appointmentDate": "2026-04-01",
  "time": "10:00",
  "reason": "Regular checkup"
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
