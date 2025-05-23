// Server-side logger implementation

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

class ServerLogger {
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

  log(level, category, action, message, data = {}) {
    const logEntry = this.formatLogMessage(level, category, action, message, data);
    
    // Console output
    const prefix = `[${logEntry.category.toUpperCase()}][${action}]`;
    
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(prefix, message, data);
        break;
      case LOG_LEVELS.WARN:
        console.warn(prefix, message, data);
        break;
      case LOG_LEVELS.INFO:
        console.info(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }

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
}

// Create and export a singleton instance
const serverLogger = new ServerLogger();
export default serverLogger; 