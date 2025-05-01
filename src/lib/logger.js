const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARNING',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
};

const LOG_COLORS = {
  INFO: '\x1b[36m', // Cyan
  WARNING: '\x1b[33m', // Yellow
  ERROR: '\x1b[31m', // Red
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m', // Reset
};

const logger = {
  info: (category, message, data = {}) => {
    console.log(`[INFO][${category}] ${message}`, data);
    // You can also send logs to your backend or monitoring service here
  },
  
  error: (category, message, data = {}) => {
    console.error(`[ERROR][${category}] ${message}`, data);
    // You can also send error logs to your backend or monitoring service here
  },
  
  debug: (category, message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG][${category}] ${message}`, data);
    }
  },
  
  warn: (category, message, data = {}) => {
    console.warn(`[WARN][${category}] ${message}`, data);
  },
  
  activity: (userId, action, details = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[ACTIVITY] User ${userId} - ${action}`, {
      ...details,
      timestamp,
    });
    // You can also send activity logs to your backend for persistence
  }
};

export default logger; 