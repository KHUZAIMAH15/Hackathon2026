const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const { patientOnly } = require('../middleware/role');
const patientController = require('../controllers/patientController');

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

const appointmentsQueryValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status value'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Apply authentication and patient authorization to all routes
router.use(protect);
router.use(patientOnly);

// Routes

/**
 * @route   GET /api/patient/profile
 * @desc    Get patient's own profile
 * @access  Private/Patient
 */
router.get('/profile', patientController.getPatientProfile);

/**
 * @route   PUT /api/patient/profile
 * @desc    Update patient's own profile
 * @access  Private/Patient
 */
router.put('/profile', updateProfileValidator, patientController.updatePatientProfile);

/**
 * @route   GET /api/patient/appointments
 * @desc    Get patient's own appointments
 * @access  Private/Patient
 */
router.get('/appointments', appointmentsQueryValidator, patientController.getMyAppointments);

/**
 * @route   GET /api/patient/prescriptions
 * @desc    Get patient's own prescriptions
 * @access  Private/Patient
 */
router.get('/prescriptions', patientController.getMyPrescriptions);

module.exports = router;
