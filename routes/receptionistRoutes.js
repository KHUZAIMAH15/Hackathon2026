const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const { receptionistOnly } = require('../middleware/role');
const receptionistController = require('../controllers/receptionistController');

// Validation rules
const registerPatientValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[\d\s\-\+\(\)]{10,}$/).withMessage('Invalid phone number format'),
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', '']).withMessage('Invalid gender value'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  body('emergencyContact')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{10,}$/).withMessage('Invalid emergency contact format'),
  body('bloodGroup')
    .optional()
    .trim()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']).withMessage('Invalid blood group')
];

const bookAppointmentValidator = [
  body('patientId')
    .notEmpty().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID format'),
  body('doctorId')
    .notEmpty().withMessage('Doctor ID is required')
    .isMongoId().withMessage('Invalid doctor ID format'),
  body('appointmentDate')
    .notEmpty().withMessage('Appointment date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('time')
    .notEmpty().withMessage('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
  body('reason')
    .trim()
    .notEmpty().withMessage('Reason is required')
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
  body('appointmentType')
    .optional()
    .isIn(['general', 'follow-up', 'emergency', 'consultation', 'checkup'])
    .withMessage('Invalid appointment type')
];

const cancelAppointmentValidator = [
  param('id')
    .notEmpty().withMessage('Appointment ID is required')
    .isMongoId().withMessage('Invalid appointment ID format'),
  body('cancellationReason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Cancellation reason cannot exceed 500 characters')
];

const appointmentsQueryValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status value'),
  query('doctorId')
    .optional()
    .isMongoId().withMessage('Invalid doctor ID format'),
  query('patientId')
    .optional()
    .isMongoId().withMessage('Invalid patient ID format'),
  query('appointmentDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Apply authentication and receptionist authorization to all routes
router.use(protect);
router.use(receptionistOnly);

// Routes

/**
 * @route   POST /api/receptionist/patients
 * @desc    Register a new patient
 * @access  Private/Receptionist
 */
router.post('/patients', registerPatientValidator, receptionistController.registerPatient);

/**
 * @route   GET /api/receptionist/patients
 * @desc    Get all patients with pagination and filters
 * @access  Private/Receptionist
 */
router.get('/patients', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const User = require('../models/User');

    const query = { role: 'patient' };
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const total = await User.countDocuments(query);
    const patients = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patients'
    });
  }
});

/**
 * @route   POST /api/receptionist/appointments
 * @desc    Book a new appointment
 * @access  Private/Receptionist
 */
router.post('/appointments', bookAppointmentValidator, receptionistController.bookAppointment);

/**
 * @route   GET /api/receptionist/appointments
 * @desc    Get all appointments with filters
 * @access  Private/Receptionist
 */
router.get('/appointments', appointmentsQueryValidator, receptionistController.getAllAppointments);

/**
 * @route   PUT /api/receptionist/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private/Receptionist
 */
router.put('/appointments/:id/cancel', cancelAppointmentValidator, receptionistController.cancelAppointment);

module.exports = router;
