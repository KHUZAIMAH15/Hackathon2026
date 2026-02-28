const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private/Patient
const getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user.userId).select('-password');

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient profile'
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private/Patient
const updatePatientProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, address, emergencyContact, bloodGroup } = req.body;

    // Find patient
    const patient = await User.findById(req.user.userId);

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update allowed fields (email cannot be changed for security)
    if (name) patient.name = name;
    if (phone) patient.phone = phone;
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (gender) patient.gender = gender;
    if (address) patient.address = address;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (bloodGroup) patient.bloodGroup = bloodGroup;

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: await User.findById(patient._id).select('-password')
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating patient profile'
    });
  }
};

// @desc    Get patient's appointments
// @route   GET /api/patient/appointments
// @access  Private/Patient
const getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { patient: req.user.userId };

    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await Appointment.countDocuments(query);

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1, time: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('doctor', 'name specialization email phone')
      .populate('patient', 'name email');

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
};

// @desc    Get patient's prescriptions
// @route   GET /api/patient/prescriptions
// @access  Private/Patient
const getMyPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get total count
    const total = await Prescription.countDocuments({ patient: req.user.userId });

    // Get prescriptions with pagination
    const prescriptions = await Prescription.find({ patient: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('doctor', 'name specialization email')
      .populate('patient', 'name email')
      .populate('appointment');

    res.status(200).json({
      success: true,
      data: prescriptions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prescriptions'
    });
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getMyAppointments,
  getMyPrescriptions
};
