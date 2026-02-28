const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// @desc    Create a new doctor
// @route   POST /api/admin/doctors
// @access  Private/Admin
const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, qualifications, experience, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and specialization are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if doctor already exists
    const existingDoctor = await User.findOne({ email, role: 'doctor' });
    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: 'Doctor with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create doctor
    const doctor = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
      specialization,
      qualifications: qualifications || '',
      experience: experience || 0,
      phone: phone || ''
    });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        role: doctor.role
      }
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating doctor'
    });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
      });
    }

    // Check if doctor exists
    const doctor = await User.findOne({ _id: id, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Prevent deleting self
    if (doctor._id.toString() === req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete by marking inactive
    if (doctor.isActive !== undefined) {
      doctor.isActive = false;
      await doctor.save();
    } else {
      await User.findByIdAndDelete(id);
    }

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting doctor'
    });
  }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
const getAllDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization, search } = req.query;

    // Build query
    const query = { role: 'doctor' };
    
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') }
      ];
    }

    // Get total count
    const total = await User.countDocuments(query);

    // Get doctors with pagination
    const doctors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctors'
    });
  }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private/Admin
const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build query
    const query = { role: 'patient' };
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    // Get total count
    const total = await User.countDocuments(query);

    // Get patients with pagination
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
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patients'
    });
  }
};

// @desc    Create a new receptionist
// @route   POST /api/admin/receptionists
// @access  Private/Admin
const createReceptionist = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if receptionist already exists
    const existingReceptionist = await User.findOne({ email, role: 'receptionist' });
    if (existingReceptionist) {
      return res.status(409).json({
        success: false,
        message: 'Receptionist with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create receptionist
    const receptionist = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'receptionist',
      phone: phone || ''
    });

    res.status(201).json({
      success: true,
      message: 'Receptionist created successfully',
      data: {
        id: receptionist._id,
        name: receptionist.name,
        email: receptionist.email,
        role: receptionist.role
      }
    });
  } catch (error) {
    console.error('Create receptionist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating receptionist'
    });
  }
};

// @desc    Delete a receptionist
// @route   DELETE /api/admin/receptionists/:id
// @access  Private/Admin
const deleteReceptionist = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receptionist ID'
      });
    }

    // Check if receptionist exists
    const receptionist = await User.findOne({ _id: id, role: 'receptionist' });
    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }

    // Prevent deleting self
    if (receptionist._id.toString() === req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete or hard delete
    if (receptionist.isActive !== undefined) {
      receptionist.isActive = false;
      await receptionist.save();
    } else {
      await User.findByIdAndDelete(id);
    }

    res.status(200).json({
      success: true,
      message: 'Receptionist deleted successfully'
    });
  } catch (error) {
    console.error('Delete receptionist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting receptionist'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get counts for each role
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalReceptionists = await User.countDocuments({ role: 'receptionist' });

    // Get appointment statistics
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    res.status(200).json({
      success: true,
      data: {
        users: {
          totalDoctors,
          totalPatients,
          totalReceptionists
        },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          today: todayAppointments
        },
        recentAppointments
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

module.exports = {
  createDoctor,
  deleteDoctor,
  getAllDoctors,
  getAllPatients,
  createReceptionist,
  deleteReceptionist,
  getDashboardStats
};
