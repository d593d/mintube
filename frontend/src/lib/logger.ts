type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') {
      return false;
    }
    return true;
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.shouldLog('debug')) {
      const entry = this.formatMessage('debug', message, context);
      console.debug(`[${entry.timestamp}] DEBUG: ${message}`, context || '');
    }
  }

  info(message: string, context?: Record<string, any>) {
    if (this.shouldLog('info')) {
      const entry = this.formatMessage('info', message, context);
      console.info(`[${entry.timestamp}] INFO: ${message}`, context || '');
    }
  }

  warn(message: string, context?: Record<string, any>) {
    if (this.shouldLog('warn')) {
      const entry = this.formatMessage('warn', message, context);
      console.warn(`[${entry.timestamp}] WARN: ${message}`, context || '');
    }
  }

  error(message: string, error?: Error | any, context?: Record<string, any>) {
    if (this.shouldLog('error')) {
      const entry = this.formatMessage('error', message, { ...context, error: error?.message || error });
      console.error(`[${entry.timestamp}] ERROR: ${message}`, error, context || '');
      
      // In production, you might want to send this to an error tracking service
      if (!this.isDevelopment) {
        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      }
    }
  }
}

export const logger = new Logger();