/**
 * Swagger Configuration for Hospital Management System API
 * Install dependencies: npm install swagger-jsdoc swagger-ui-express
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Management System API',
      version: '1.0.0',
      description: 'A comprehensive REST API for managing hospital operations including appointments, prescriptions, and user management.',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['patient', 'doctor', 'admin', 'receptionist'] },
            phone: { type: 'string' },
            isActive: { type: 'boolean', default: true }
          }
        },
        Appointment: {
          type: 'object',
          required: ['patient', 'doctor', 'appointmentDate', 'time', 'reason'],
          properties: {
            patient: { type: 'string', description: 'Patient ID (ObjectId)' },
            doctor: { type: 'string', description: 'Doctor ID (ObjectId)' },
            appointmentDate: { type: 'string', format: 'date' },
            time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'] },
            reason: { type: 'string', maxLength: 500 },
            appointmentType: { type: 'string', enum: ['general', 'follow-up', 'emergency', 'consultation', 'checkup'] }
          }
        },
        Prescription: {
          type: 'object',
          required: ['appointment', 'medicines'],
          properties: {
            appointment: { type: 'string', description: 'Appointment ID (ObjectId)' },
            medicines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  dosage: { type: 'string' },
                  frequency: { type: 'string' }
                }
              }
            },
            diagnosis: { type: 'string' },
            instructions: { type: 'string' },
            followUpDate: { type: 'string', format: 'date' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './models/*.js'] // Path to the API docs
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }));
};

module.exports = setupSwagger;
