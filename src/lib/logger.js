/**
 * logger.js
 * ---------------------------------------------------------------------------
 * Standardized logging utility for the application. Encapsulates console logs
 * in structured JSON format with timestamps and error stack traces.
 * ---------------------------------------------------------------------------
 */



export const Logger = {
  info(message, context = {}) {
    console.log(
      JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message,
        ...context
      })
    );
  },
  warn(message, context = {}) {
    console.warn(
      JSON.stringify({
        level: 'WARN',
        timestamp: new Date().toISOString(),
        message,
        ...context
      })
    );
  },
/**
 * Logs an error with optional Error object.
 * @param {string} message
 * @param {Error|object|null} [error=null]
 * @param {object} [context={}] 
 */
  error(message, error = null, context = {}) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        error: error ? { message: error.message, stack: error.stack } : null,
        ...context
      })
    );
  }
};
