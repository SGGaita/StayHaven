'use client';

const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

const LOG_CATEGORIES = {
  AUTH: 'auth',
  API: 'api',
  APP: 'app',
  ADMIN: 'admin',
};

class Logger {
  constructor() {
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.initializeStorage();
    }
  }

  initializeStorage() {
    try {
      if (!this.isClient) return;
      
      // Initialize separate storage for different log categories
      const categories = Object.values(LOG_CATEGORIES);
      categories.forEach(category => {
        if (!localStorage.getItem(`logs_${category}`)) {
          localStorage.setItem(`logs_${category}`, JSON.stringify([]));
        }
      });
    } catch (error) {
      console.error('Failed to initialize log storage:', error);
    }
  }

  formatLogMessage(level, category, action, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      action,
      message,
      data,
    };
  }

  persistLog(logEntry) {
    if (!this.isClient) return;

    try {
      const storageKey = `logs_${logEntry.category}`;
      const logs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      logs.push(logEntry);
      // Keep only last 1000 logs per category
      if (logs.length > 1000) logs.shift();
      localStorage.setItem(storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to persist log:', error);
    }
  }

  log(level, category, action, message, data = {}) {
    const logEntry = this.formatLogMessage(level, category, action, message, data);
    
    // Console output with color coding
    const colors = {
      [LOG_LEVELS.DEBUG]: '#6c757d',
      [LOG_LEVELS.INFO]: '#0d6efd',
      [LOG_LEVELS.WARN]: '#ffc107',
      [LOG_LEVELS.ERROR]: '#dc3545',
    };

    if (this.isClient) {
      console.log(
        `%c[${logEntry.category.toUpperCase()}][${action}] ${message}`,
        `color: ${colors[level]}`,
        data
      );
    } else {
      console.log(`[${logEntry.category.toUpperCase()}][${action}] ${message}`, data);
    }

    // Persist log
    this.persistLog(logEntry);

    return logEntry;
  }

  // API Activity Logging
  apiInfo(action, message, data = {}) {
    return this.log(LOG_LEVELS.INFO, LOG_CATEGORIES.API, action, message, data);
  }

  apiError(action, message, data = {}) {
    return this.log(LOG_LEVELS.ERROR, LOG_CATEGORIES.API, action, message, data);
  }

  apiWarn(action, message, data = {}) {
    return this.log(LOG_LEVELS.WARN, LOG_CATEGORIES.API, action, message, data);
  }

  apiDebug(action, message, data = {}) {
    return this.log(LOG_LEVELS.DEBUG, LOG_CATEGORIES.API, action, message, data);
  }

  // Auth Activity Logging
  authInfo(action, message, data = {}) {
    return this.log(LOG_LEVELS.INFO, LOG_CATEGORIES.AUTH, action, message, data);
  }

  authError(action, message, data = {}) {
    return this.log(LOG_LEVELS.ERROR, LOG_CATEGORIES.AUTH, action, message, data);
  }

  authWarn(action, message, data = {}) {
    return this.log(LOG_LEVELS.WARN, LOG_CATEGORIES.AUTH, action, message, data);
  }

  authDebug(action, message, data = {}) {
    return this.log(LOG_LEVELS.DEBUG, LOG_CATEGORIES.AUTH, action, message, data);
  }

  // Admin Activity Logging
  adminInfo(action, message, data = {}) {
    return this.log(LOG_LEVELS.INFO, LOG_CATEGORIES.ADMIN, action, message, data);
  }

  adminError(action, message, data = {}) {
    return this.log(LOG_LEVELS.ERROR, LOG_CATEGORIES.ADMIN, action, message, data);
  }

  adminWarn(action, message, data = {}) {
    return this.log(LOG_LEVELS.WARN, LOG_CATEGORIES.ADMIN, action, message, data);
  }

  adminDebug(action, message, data = {}) {
    return this.log(LOG_LEVELS.DEBUG, LOG_CATEGORIES.ADMIN, action, message, data);
  }

  // General App Activity Logging
  appInfo(action, message, data = {}) {
    return this.log(LOG_LEVELS.INFO, LOG_CATEGORIES.APP, action, message, data);
  }

  appError(action, message, data = {}) {
    return this.log(LOG_LEVELS.ERROR, LOG_CATEGORIES.APP, action, message, data);
  }

  appWarn(action, message, data = {}) {
    return this.log(LOG_LEVELS.WARN, LOG_CATEGORIES.APP, action, message, data);
  }

  appDebug(action, message, data = {}) {
    return this.log(LOG_LEVELS.DEBUG, LOG_CATEGORIES.APP, action, message, data);
  }

  // Utility methods to retrieve logs
  getLogs(category) {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(`logs_${category}`) || '[]');
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  clearLogs(category) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`logs_${category}`, JSON.stringify([]));
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

const logger = new Logger();
export default logger; 