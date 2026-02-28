# 🏥 Hospital Management System - Backend API

A comprehensive RESTful API for managing hospital operations including appointments, prescriptions, and user management.

## 📋 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Doctor, Receptionist, Patient)
  - Password reset functionality

- **Admin Features**
  - Dashboard statistics
  - Manage doctors, patients, and receptionists
  - User management

- **Doctor Features**
  - View and manage appointments
  - Create prescriptions
  - Update appointment status

- **Receptionist Features**
  - Register patients
  - Book appointments
  - Manage appointment schedules

- **Patient Features**
  - View appointments
  - View prescriptions
  - Update profile

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection, MongoDB Sanitization
- **Documentation**: Swagger/OpenAPI

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/hospital-management
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Access the API**
   - API: http://localhost:5000
   - Swagger Docs: http://localhost:5000/api-docs
   - Health Check: http://localhost:5000/api/health

## 📚 API Documentation

### Quick Reference

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/register` | POST | Register new patient | Public |
| `/api/auth/login` | POST | Login | Public |
| `/api/auth/me` | GET | Get current user | Private |
| `/api/admin/dashboard` | GET | Dashboard stats | Admin |
| `/api/doctor/appointments` | GET | Doctor's appointments | Doctor |
| `/api/receptionist/appointments` | POST | Book appointment | Receptionist |
| `/api/patient/appointments` | GET | Patient's appointments | Patient |

For complete API documentation, see [API.md](./API.md) or visit `/api-docs` when running the server.

## 🧪 Testing

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## 📁 Project Structure

```
backend/
├── controllers/       # Request handlers
├── middleware/        # Custom middleware (auth, validation, error handling)
├── models/           # Mongoose schemas
├── routes/           # API routes
├── utils/            # Utility functions
├── tests/            # Test files
├── .env              # Environment variables
├── server.js         # Entry point
└── package.json
```

## 🔐 Security Features

- **Helmet**: Sets security HTTP headers
- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevents brute force attacks
- **XSS Protection**: Sanitizes user input
- **MongoDB Sanitization**: Prevents NoSQL injection
- **Password Hashing**: bcrypt with salt rounds
- **JWT**: Secure token-based authentication

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/hospital-management |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT token expiration | 30d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For API support, contact the development team or open an issue in the repository.

---

**Built with ❤️ for Healthcare**
