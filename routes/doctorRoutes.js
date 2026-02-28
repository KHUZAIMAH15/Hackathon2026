const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const { doctorOnly } = require('../middleware/role');
const doctorController = require('../controllers/doctorController');

// Validation rules
const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{10,}$/).withMessage('Invalid phone number format'),
  body('specialization')
    .optional()
    .trim()
    .notEmpty().withMessage('Specialization cannot be empty'),
  body('qualifications')
    .optional()
    .trim(),
  body('experience')
    .optional()
    .isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('availability')
    .optional()
    .isObject().withMessage('Availability must be an object')
];

const updateAppointmentStatusValidator = [
  param('id')
    .notEmpty().withMessage('Appointment ID is required')
    .isMongoId().withMessage('Invalid appointment ID format'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status value'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

const addPrescriptionValidator = [
  body('appointmentId')
    .notEmpty().withMessage('Appointment ID is required')
    .isMongoId().withMessage('Invalid appointment ID format'),
  body('medicines')
    .isArray({ min: 1 }).withMessage('At least one medicine is required'),
  body('medicines.*.name')
    .trim()
    .notEmpty().withMessage('Medicine name is required')
    .isLength({ max: 100 }).withMessage('Medicine name cannot exceed 100 characters'),
  body('medicines.*.dosage')
    .trim()
    .notEmpty().withMessage('Dosage is required')
    .isLength({ max: 50 }).withMessage('Dosage cannot exceed 50 characters'),
  body('medicines.*.frequency')
    .trim()
    .notEmpty().withMessage('Frequency is required')
    .isLength({ max: 50 }).withMessage('Frequency cannot exceed 50 characters'),
  body('medicines.*.duration')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Duration cannot exceed 50 characters'),
  body('diagnosis')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Diagnosis cannot exceed 500 characters'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Instructions cannot exceed 1000 characters'),
  body('followUpDate')
    .optional()
    .isISO8601().withMessage('Invalid date format for follow-up')
];

const appointmentsQueryValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status value'),
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

// Apply authentication and doctor authorization to all routes
router.use(protect);
router.use(doctorOnly);

// Routes

/**
 * @route   GET /api/doctor/profile
 * @desc    Get doctor's own profile
 * @access  Private/Doctor
 */
router.get('/profile', doctorController.getDoctorProfile);

/**
 * @route   PUT /api/doctor/profile
 * @desc    Update doctor's own profile
 * @access  Private/Doctor
 */
router.put('/profile', updateProfileValidator, doctorController.updateDoctorProfile);

/**
 * @route   GET /api/doctor/appointments
 * @desc    Get doctor's assigned appointments with filters
 * @access  Private/Doctor
 */
router.get('/appointments', appointmentsQueryValidator, doctorController.getDoctorAppointments);

/**
 * @route   PUT /api/doctor/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private/Doctor
 */
router.put('/appointments/:id/status', updateAppointmentStatusValidator, doctorController.updateAppointmentStatus);

/**
 * @route   POST /api/doctor/prescriptions
 * @desc    Add a new prescription
 * @access  Private/Doctor
 */
router.post('/prescriptions', addPrescriptionValidator, doctorController.addPrescription);

module.exports = router;
