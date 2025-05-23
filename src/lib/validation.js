import logger from './logger';

// Regular expressions for validation
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Validation error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field) => `${field} is required`,
  INVALID_EMAIL: 'Please provide a valid email address',
  WEAK_PASSWORD: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  TERMS_NOT_AGREED: 'Please agree to the Terms of Service and Privacy Policy',
  INVALID_ROLE: 'Invalid role specified',
  USER_EXISTS: 'User with this email already exists',
};

// Validation functions
export const validateEmail = (email) => {
  if (!email) return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD('Email') };
  if (!VALIDATION_PATTERNS.EMAIL.test(email)) return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  return { isValid: true };
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD('Password') };
  if (!VALIDATION_PATTERNS.PASSWORD.test(password)) return { isValid: false, error: ERROR_MESSAGES.WEAK_PASSWORD };
  return { isValid: true };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return { isValid: false, error: ERROR_MESSAGES.PASSWORDS_DONT_MATCH };
  return { isValid: true };
};

export const validateRequiredFields = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD(key) };
  }
  return { isValid: true };
};

export const validateRole = (role, validRoles = ['CUSTOMER', 'PROPERTY_MANAGER', 'ADMIN', 'SUPER_ADMIN']) => {
  if (!validRoles.includes(role)) return { isValid: false, error: ERROR_MESSAGES.INVALID_ROLE };
  return { isValid: true };
};

// Logging wrapper for validation
export const logValidationError = (context, error, metadata = {}) => {
  logger.authWarn('validation', `Validation error in ${context}`, {
    error,
    ...metadata,
  });
}; 