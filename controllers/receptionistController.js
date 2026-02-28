const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// @desc    Register a new patient
// @route   POST /api/receptionist/patients
// @access  Private/Receptionist
const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, address, emergencyContact, bloodGroup } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone are required'
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

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Check if patient already exists
    const existingPatient = await User.findOne({ email, role: 'patient' });
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'Patient with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create patient
    const patient = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'patient',
      phone,
      dateOfBirth: dateOfBirth || null,
      gender: gender || '',
      address: address || '',
      emergencyContact: emergencyContact || '',
      bloodGroup: bloodGroup || ''
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        role: patient.role
      }
    });
  } catch (error) {
    console.error('Register patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering patient'
    });
  }
};

// @desc    Book an appointment
// @route   POST /api/receptionist/appointments
// @access  Private/Receptionist
const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, time, reason, appointmentType } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !appointmentDate || !time) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, doctor ID, appointment date, and time are required'
      });
    }

    // Validate date format
    const date = new Date(appointmentDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointment for a past date'
      });
    }

    // Verify patient exists
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify doctor exists and is active
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check for conflicting appointment
    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const conflictingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: {
        $gte: selectedDate,
        $lt: nextDate
      },
      time: time,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'Doctor already has an appointment at this time'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate: date,
      time,
      reason: reason || '',
      appointmentType: appointmentType || 'general',
      status: 'pending',
      bookedBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: await Appointment.findById(appointment._id)
        .populate('patient', 'name email phone')
        .populate('doctor', 'name specialization')
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment'
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/receptionist/appointments
// @access  Private/Receptionist
const getAllAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, appointmentDate, page = 1, limit = 15 } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (doctorId) {
      query.doctor = doctorId;
    }

    if (patientId) {
      query.patient = patientId;
    }

    if (appointmentDate) {
      const selectedDate = new Date(appointmentDate);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.appointmentDate = {
        $gte: selectedDate,
        $lt: nextDate
      };
    }

    // Get total count
    const total = await Appointment.countDocuments(query);

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, time: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .populate('bookedBy', 'name role');

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
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/receptionist/appointments/:id/cancel
// @access  Private/Receptionist
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    // Validate ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if already cancelled or completed
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment with status: ${appointment.status}`
      });
    }

    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user.userId;
    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: await Appointment.findById(id)
        .populate('patient', 'name email')
        .populate('doctor', 'name specialization')
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment'
    });
  }
};

module.exports = {
  registerPatient,
  bookAppointment,
  getAllAppointments,
  cancelAppointment
};
