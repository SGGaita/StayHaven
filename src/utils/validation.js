// Regular expressions for validation
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Validation messages
export const MESSAGES = {
  REQUIRED_FIELDS: 'Please provide all required fields',
  INVALID_EMAIL: 'Please provide a valid email address',
  WEAK_PASSWORD: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  USER_EXISTS: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TERMS_REQUIRED: 'Please agree to the Terms of Service and Privacy Policy',
  INVALID_ROLE: 'Invalid role specified',
  SERVER_ERROR: 'An error occurred. Please try again later',
  NETWORK_ERROR: 'Network error or server is unavailable',
};

// Valid roles
export const VALID_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PROPERTY_MANAGER: 'PROPERTY_MANAGER',
  CUSTOMER: 'CUSTOMER',
};

// Validation functions
export const validateEmail = (email) => REGEX.EMAIL.test(email);

export const validatePassword = (password) => REGEX.PASSWORD.test(password);

export const validateRole = (role) => Object.values(VALID_ROLES).includes(role);

export const validateRequiredFields = (fields) => {
  return Object.values(fields).every(field => 
    field !== undefined && field !== null && field !== ''
  );
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// Form validation
export const validateAuthForm = (formData, isSignup = false) => {
  if (!validateRequiredFields(formData)) {
    return { isValid: false, error: MESSAGES.REQUIRED_FIELDS };
  }

  if (!validateEmail(formData.email)) {
    return { isValid: false, error: MESSAGES.INVALID_EMAIL };
  }

  if (isSignup) {
    if (!validatePassword(formData.password)) {
      return { isValid: false, error: MESSAGES.WEAK_PASSWORD };
    }

    if (formData.password !== formData.confirmPassword) {
      return { isValid: false, error: MESSAGES.PASSWORDS_DONT_MATCH };
    }

    if (!formData.agreeToTerms) {
      return { isValid: false, error: MESSAGES.TERMS_REQUIRED };
    }

    if (!validateRole(formData.role)) {
      return { isValid: false, error: MESSAGES.INVALID_ROLE };
    }
  }

  return { isValid: true, error: null };
}; 