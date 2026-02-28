const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');
const { handleValidationErrors } = require('../middleware/errorHandler');

// Validation rules
const registerValidator = [
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
  body('role')
    .optional()
    .isIn(['patient']).withMessage('Only patient role can self-register'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{10,}$/).withMessage('Invalid phone number format'),
  body('specialization')
    .optional()
    .trim()
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const updatePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
];

const resetPasswordValidator = [
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Routes

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (patients only)
 * @access  Public
 */
router.post('/register', registerValidator, handleValidationErrors, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidator, handleValidationErrors, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   PUT /api/auth/password
 * @desc    Update current user password
 * @access  Private
 */
router.put('/password', protect, updatePasswordValidator, handleValidationErrors, authController.updatePassword);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset token
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidator, handleValidationErrors, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password/:token', resetPasswordValidator, handleValidationErrors, authController.resetPassword);

module.exports = router;
