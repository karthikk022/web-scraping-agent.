/**
 * Error Handling & Logging Utilities
 * 
 * Provides robust error handling, custom exceptions, and structured logging
 * for the web scraping agent.
 */

const fs = require('fs');
const path = require('path');

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Custom logger class
 */
class Logger {
  constructor(options = {}) {
    this.level = options.level || LogLevel.INFO;
    this.file = options.file || null;
    this.tags = options.tags || [];
  }

  /**
   * Format log message with timestamp and level
   */
  format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LogLevel).find(key => LogLevel[key] === level);
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    
    return `[${timestamp}] [${levelName}] ${message}${metaStr}`;
  }

  /**
   * Write log to console and file
   */
  write(level, message, meta = {}) {
    if (level < this.level) return;

    const formatted = this.format(level, message, meta);

    // Console output with colors
    switch (level) {
      case LogLevel.DEBUG:
        console.log(`🔍 ${formatted}`);
        break;
      case LogLevel.INFO:
        console.log(`ℹ️  ${formatted}`);
        break;
      case LogLevel.WARN:
        console.warn(`⚠️  ${formatted}`);
        break;
      case LogLevel.ERROR:
        console.error(`❌ ${formatted}`);
        break;
      case LogLevel.FATAL:
        console.error(`🔴 ${formatted}`);
        break;
    }

    // File logging
    if (this.file) {
      this.writeToFile(formatted);
    }
  }

  /**
   * Write to log file
   */
  writeToFile(message) {
    try {
      const dir = path.dirname(this.file);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(this.file, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  debug(message, meta) { this.write(LogLevel.DEBUG, message, meta); }
  info(message, meta) { this.write(LogLevel.INFO, message, meta); }
  warn(message, meta) { this.write(LogLevel.WARN, message, meta); }
  error(message, meta) { this.write(LogLevel.ERROR, message, meta); }
  fatal(message, meta) { this.write(LogLevel.FATAL, message, meta); }
}

/**
 * Custom error classes
 */
class ScrapingError extends Error {
  constructor(message, code = 'SCRAPING_ERROR', statusCode = 500) {
    super(message);
    this.name = 'ScrapingError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };
  }
}

class NetworkError extends ScrapingError {
  constructor(message, url) {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
    this.url = url;
  }
}

class TimeoutError extends ScrapingError {
  constructor(message, timeout) {
    super(message, 'TIMEOUT_ERROR', 408);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

class ValidationError extends ScrapingError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class ExtractionError extends ScrapingError {
  constructor(message, selector) {
    super(message, 'EXTRACTION_ERROR', 422);
    this.name = 'ExtractionError';
    this.selector = selector;
  }
}

/**
 * Error handler middleware
 */
class ErrorHandler {
  constructor(logger) {
    this.logger = logger;
    this.errorCount = 0;
  }

  /**
   * Handle synchronous errors
   */
  handle(error, context = {}) {
    this.errorCount++;

    // Log the error
    this.logger.error(`[${context.operation || 'unknown'}] ${error.message}`, {
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join(' | ')
    });

    // Track error frequency
    if (this.errorCount > 5) {
      this.logger.fatal('Too many errors detected, operation may be failing', {
        errorCount: this.errorCount
      });
    }

    // Return error response
    return {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: error.timestamp || new Date().toISOString()
    };
  }

  /**
   * Retry logic with exponential backoff
   */
  async retry(fn, options = {}) {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2
    } = options;

    let lastError;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${maxAttempts}...`);
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxAttempts) {
          this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
            error: error.message
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Validate input parameters
   */
  validateInput(input, schema) {
    for (const [key, rules] of Object.entries(schema)) {
      const value = input[key];

      // Check required
      if (rules.required && !value) {
        throw new ValidationError(`${key} is required`, key);
      }

      // Check type
      if (value && rules.type && typeof value !== rules.type) {
        throw new ValidationError(
          `${key} must be ${rules.type}, got ${typeof value}`,
          key
        );
      }

      // Check URL format
      if (rules.type === 'url' && value) {
        try {
          new URL(value);
        } catch {
          throw new ValidationError(`${key} must be a valid URL`, key);
        }
      }

      // Check array items
      if (rules.type === 'array' && Array.isArray(value)) {
        if (rules.itemType) {
          for (const item of value) {
            if (typeof item !== rules.itemType) {
              throw new ValidationError(
                `${key} items must be ${rules.itemType}`,
                key
              );
            }
          }
        }
      }
    }

    return true;
  }
}

/**
 * Health check utility
 */
class HealthCheck {
  constructor(logger) {
    this.logger = logger;
    this.checks = [];
  }

  /**
   * Add a health check
   */
  addCheck(name, checkFn) {
    this.checks.push({ name, fn: checkFn });
  }

  /**
   * Run all health checks
   */
  async runAll() {
    const results = {
      healthy: true,
      timestamp: new Date().toISOString(),
      checks: {}
    };

    for (const check of this.checks) {
      try {
        await check.fn();
        results.checks[check.name] = { status: 'ok' };
      } catch (error) {
        results.checks[check.name] = { 
          status: 'failed', 
          error: error.message 
        };
        results.healthy = false;
        this.logger.warn(`Health check failed: ${check.name}`, {
          error: error.message
        });
      }
    }

    return results;
  }
}

/**
 * Performance monitoring
 */
class PerformanceMonitor {
  constructor(logger) {
    this.logger = logger;
    this.metrics = {};
  }

  /**
   * Start measuring execution time
   */
  start(label) {
    if (!this.metrics[label]) {
      this.metrics[label] = {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0
      };
    }
    return {
      label,
      startTime: Date.now()
    };
  }

  /**
   * End measuring and record metric
   */
  end(timer) {
    const duration = Date.now() - timer.startTime;
    const metric = this.metrics[timer.label];

    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);

    this.logger.debug(`${timer.label} completed in ${duration}ms`);

    return duration;
  }

  /**
   * Get performance summary
   */
  getSummary(label) {
    const metric = this.metrics[label];
    if (!metric) return null;

    return {
      label,
      count: metric.count,
      totalTime: `${metric.totalTime}ms`,
      avgTime: `${(metric.totalTime / metric.count).toFixed(2)}ms`,
      minTime: `${metric.minTime}ms`,
      maxTime: `${metric.maxTime}ms`
    };
  }

  /**
   * Get all metrics
   */
  getAll() {
    return Object.entries(this.metrics).reduce((acc, [label, metric]) => {
      acc[label] = this.getSummary(label);
      return acc;
    }, {});
  }
}

module.exports = {
  Logger,
  LogLevel,
  ErrorHandler,
  HealthCheck,
  PerformanceMonitor,
  // Custom error classes
  ScrapingError,
  NetworkError,
  TimeoutError,
  ValidationError,
  ExtractionError
};
