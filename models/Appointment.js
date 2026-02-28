const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required']
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required']
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        message: 'Status must be pending, confirmed, in-progress, completed, cancelled, or no-show'
      },
      default: 'pending'
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    appointmentType: {
      type: String,
      enum: ['general', 'follow-up', 'emergency', 'consultation', 'checkup'],
      default: 'general'
    },
    // Tracking who booked the appointment
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Cancellation details
    cancelledAt: {
      type: Date
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationReason: {
      type: String,
      trim: true
    },
    // Completion details
    completedAt: {
      type: Date
    },
    // Duration in minutes
    duration: {
      type: Number,
      default: 30,
      min: [15, 'Minimum appointment duration is 15 minutes'],
      max: [120, 'Maximum appointment duration is 120 minutes']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1, time: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

// Validate appointment date is not in the past
appointmentSchema.pre('save', function(next) {
  if (this.isNew && this.appointmentDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (this.appointmentDate < today) {
      const error = new Error('Appointment date cannot be in the past');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Virtual for checking if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const appointmentDateTime = new Date(`${this.appointmentDate.toISOString().split('T')[0]}T${this.time}`);
  return appointmentDateTime > now && this.status !== 'cancelled' && this.status !== 'completed';
});

// Virtual for checking if appointment is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return (
    today.getDate() === appointmentDate.getDate() &&
    today.getMonth() === appointmentDate.getMonth() &&
    today.getFullYear() === appointmentDate.getFullYear()
  );
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
