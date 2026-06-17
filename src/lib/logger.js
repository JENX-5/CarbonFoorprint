/**
 * logger.js
 * ---------------------------------------------------------------------------
 * Standardized logging utility for the application. Encapsulates console logs
 * in structured JSON format with timestamps and error stack traces.
 * ---------------------------------------------------------------------------
 */

/**
 * Structured logger that outputs logs in JSON format with timestamps.
 */
export const Logger = {
  /**
   * Logs an informational message with optional structured context.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, any>} [context={}] - Additional key-value pairs for context.
   */
  info(message, context = {}) {
    console.log(
      JSON.stringify({
        level: "INFO",
        timestamp: new Date().toISOString(),
        message,
        ...context,
      }),
    );
  },

  /**
   * Logs a warning message with optional structured context.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, any>} [context={}] - Additional key-value pairs for context.
   */
  warn(message, context = {}) {
    console.warn(
      JSON.stringify({
        level: "WARN",
        timestamp: new Date().toISOString(),
        message,
        ...context,
      }),
    );
  },

  /**
   * Logs an error message with optional Error object and structured context.
   *
   * @param {string} message - The error explanation message.
   * @param {Error|null} [error=null] - The Error object containing stack trace.
   * @param {Record<string, any>} [context={}] - Additional context information.
   */
  error(message, error = null, context = {}) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        timestamp: new Date().toISOString(),
        message,
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : null,
        ...context,
      }),
    );
  },
};
