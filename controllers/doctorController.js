const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// @desc    Get doctor profile
// @route   GET /api/doctor/profile
// @access  Private/Doctor
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.userId).select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctor profile'
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctor/profile
// @access  Private/Doctor
const updateDoctorProfile = async (req, res) => {
  try {
    const { name, phone, specialization, qualifications, experience, availability } = req.body;

    // Find doctor
    const doctor = await User.findById(req.user.userId);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update allowed fields
    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (specialization) doctor.specialization = specialization;
    if (qualifications) doctor.qualifications = qualifications;
    if (experience !== undefined) doctor.experience = experience;
    if (availability) doctor.availability = availability;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: await User.findById(doctor._id).select('-password')
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating doctor profile'
    });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/doctor/appointments
// @access  Private/Doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, appointmentDate, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { doctor: req.user.userId };

    if (status) {
      query.status = status;
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
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name specialization');

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
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private/Doctor
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
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

    // Verify doctor owns this appointment
    if (appointment.doctor.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update status
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;

    // Set completedAt if status is completed
    if (status === 'completed') {
      appointment.completedAt = new Date();
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: await Appointment.findById(id).populate('patient', 'name email').populate('doctor', 'name specialization')
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment status'
    });
  }
};

// @desc    Add prescription
// @route   POST /api/doctor/prescriptions
// @access  Private/Doctor
const addPrescription = async (req, res) => {
  try {
    const { appointmentId, medicines, diagnosis, instructions, followUpDate } = req.body;

    // Validate required fields
    if (!appointmentId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and medicines array are required'
      });
    }

    // Validate medicines
    for (const med of medicines) {
      if (!med.name || !med.dosage || !med.frequency) {
        return res.status(400).json({
          success: false,
          message: 'Each medication must have name, dosage, and frequency'
        });
      }
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify doctor owns this appointment
    if (appointment.doctor.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add prescription for this appointment'
      });
    }

    // Create prescription
    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: req.user.userId,
      medicines,
      diagnosis: diagnosis || '',
      instructions: instructions || '',
      followUpDate: followUpDate || null
    });

    // Update appointment status to completed if not already
    if (appointment.status !== 'completed') {
      appointment.status = 'completed';
      appointment.completedAt = new Date();
      await appointment.save();
    }

    res.status(201).json({
      success: true,
      message: 'Prescription added successfully',
      data: await Prescription.findById(prescription._id)
        .populate('patient', 'name email age gender')
        .populate('doctor', 'name specialization')
        .populate('appointment')
    });
  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding prescription'
    });
  }
};

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  addPrescription
};
