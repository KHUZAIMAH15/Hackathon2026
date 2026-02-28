/**
 * Role-Based Authorization Middleware
 * Checks if the authenticated user has the required role(s)
 */

/**
 * Check for single role
 * @param {string} role - Required role
 */
const authorizeRole = (role) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    // Check if user has the required role
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${role}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Check for multiple roles (any one of them)
 * @param {string[]} roles - Array of allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    // Check if user has any of the required roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const adminOnly = authorizeRole('admin');

/**
 * Doctor only middleware
 */
const doctorOnly = authorizeRole('doctor');

/**
 * Patient only middleware
 */
const patientOnly = authorizeRole('patient');

/**
 * Receptionist only middleware
 */
const receptionistOnly = authorizeRole('receptionist');

/**
 * Admin or Doctor middleware
 */
const adminOrDoctor = authorizeRoles('admin', 'doctor');

/**
 * Admin or Receptionist middleware
 */
const adminOrReceptionist = authorizeRoles('admin', 'receptionist');

module.exports = {
  authorizeRole,
  authorizeRoles,
  adminOnly,
  doctorOnly,
  patientOnly,
  receptionistOnly,
  adminOrDoctor,
  adminOrReceptionist
};
