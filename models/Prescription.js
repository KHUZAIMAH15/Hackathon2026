const mongoose = require('mongoose');

// Sub-schema for medicine
const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: [100, 'Medicine name cannot exceed 100 characters']
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
      maxlength: [50, 'Dosage cannot exceed 50 characters']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
      maxlength: [50, 'Frequency cannot exceed 50 characters']
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    quantity: {
      type: String,
      trim: true
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [200, 'Instructions cannot exceed 200 characters']
    }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required']
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required']
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required']
    },
    medicines: {
      type: [medicineSchema],
      validate: {
        validator: function(medicines) {
          return medicines && medicines.length > 0;
        },
        message: 'Prescription must contain at least one medicine'
      }
    },
    diagnosis: {
      type: String,
      trim: true,
      maxlength: [500, 'Diagnosis cannot exceed 500 characters']
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters']
    },
    followUpDate: {
      type: Date
    },
    issuedDate: {
      type: Date,
      default: Date.now
    },
    // Additional fields for tracking
    refills: {
      type: Number,
      default: 0,
      min: [0, 'Refills cannot be negative']
    },
    isRefillable: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
prescriptionSchema.index({ patient: 1, issuedDate: -1 });
prescriptionSchema.index({ doctor: 1, issuedDate: -1 });
prescriptionSchema.index({ appointment: 1 });

// Validate follow-up date is after issued date
prescriptionSchema.pre('save', function(next) {
  if (this.followUpDate && this.followUpDate < this.issuedDate) {
    const error = new Error('Follow-up date cannot be before the issued date');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Virtual for checking if prescription is recent (within 30 days)
prescriptionSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.issuedDate > thirtyDaysAgo;
});

// Virtual for total medicines count
prescriptionSchema.virtual('totalMedicines').get(function() {
  return this.medicines ? this.medicines.length : 0;
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
