const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');
const adminController = require('../controllers/adminController');

// Validation rules
const createDoctorValidator = [
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
  body('specialization')
    .trim()
    .notEmpty().withMessage('Specialization is required'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{10,}$/).withMessage('Invalid phone number format'),
  body('experience')
    .optional()
    .isInt({ min: 0 }).withMessage('Experience must be a positive number')
];

const createReceptionistValidator = [
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
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{10,}$/).withMessage('Invalid phone number format')
];

const idValidator = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID format')
];

const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(adminOnly);

// Routes

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
router.get('/dashboard', adminController.getDashboardStats);

/**
 * @route   GET /api/admin/doctors
 * @desc    Get all doctors with pagination and filters
 * @access  Private/Admin
 */
router.get('/doctors', paginationValidator, adminController.getAllDoctors);

/**
 * @route   POST /api/admin/doctors
 * @desc    Create a new doctor
 * @access  Private/Admin
 */
router.post('/doctors', createDoctorValidator, adminController.createDoctor);

/**
 * @route   DELETE /api/admin/doctors/:id
 * @desc    Delete a doctor
 * @access  Private/Admin
 */
router.delete('/doctors/:id', idValidator, adminController.deleteDoctor);

/**
 * @route   GET /api/admin/patients
 * @desc    Get all patients with pagination and filters
 * @access  Private/Admin
 */
router.get('/patients', paginationValidator, adminController.getAllPatients);

/**
 * @route   POST /api/admin/receptionists
 * @desc    Create a new receptionist
 * @access  Private/Admin
 */
router.post('/receptionists', createReceptionistValidator, adminController.createReceptionist);

/**
 * @route   DELETE /api/admin/receptionists/:id
 * @desc    Delete a receptionist
 * @access  Private/Admin
 */
router.delete('/receptionists/:id', idValidator, adminController.deleteReceptionist);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin, doctors, patients, receptionists)
 * @access  Private/Admin
 */
router.get('/users', paginationValidator, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const User = require('../models/User');

    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update a user
 * @access  Private/Admin
 */
router.put('/users/:id', idValidator, async (req, res) => {
  try {
    const { name, phone, isActive, role } = req.body;
    const User = require('../models/User');

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role or status
    if (user._id.toString() === req.user.userId) {
      if (role || isActive !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify your own role or status'
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (role && ['patient', 'doctor', 'admin', 'receptionist'].includes(role)) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: await User.findById(user._id).select('-password')
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Private/Admin
 */
router.delete('/users/:id', idValidator, async (req, res) => {
  try {
    const User = require('../models/User');
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete
    if (user.isActive !== undefined) {
      user.isActive = false;
      await user.save();
    } else {
      await User.findByIdAndDelete(id);
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

module.exports = router;
