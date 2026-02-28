const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Exclude password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'admin', 'receptionist'],
        message: 'Role must be either patient, doctor, admin, or receptionist'
      },
      default: 'patient'
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\d\s\-\+\(\)]{10,}$/, 'Please provide a valid phone number']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Doctor-specific fields
    specialization: {
      type: String,
      trim: true
    },
    qualifications: {
      type: String,
      trim: true
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative']
    },
    availability: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    // Patient-specific fields
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: ''
    },
    address: {
      type: String,
      trim: true
    },
    emergencyContact: {
      type: String,
      trim: true
    },
    bloodGroup: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient queries (email index already created by unique: true)
userSchema.index({ role: 1, isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for getting full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    ...(this.role === 'doctor' && {
      specialization: this.specialization,
      qualifications: this.qualifications,
      experience: this.experience
    }),
    ...(this.role === 'patient' && {
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      bloodGroup: this.bloodGroup
    })
  };
});

const User = mongoose.model('User', userSchema);

module.exports = User;
