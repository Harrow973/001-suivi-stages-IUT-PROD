/**
 * Système de logging structuré pour la production
 * Remplace les console.log/error/warn par un logger configuré
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        ...(this.isDevelopment && error.stack ? { stack: error.stack } : {}),
      };
    }

    return entry;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry = this.formatLog(level, message, context, error);
    const logString = JSON.stringify(entry);

    // En production, on utilise console pour la compatibilité avec les services de logging
    // En développement, on formate de manière plus lisible
    if (this.isDevelopment) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[level];

      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `${emoji} [${entry.timestamp}] ${level.toUpperCase()}: ${message}`,
        context ? '\nContext:' : '',
        context || '',
        error ? '\nError:' : '',
        error || ''
      );
    } else {
      // En production, log JSON structuré
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](logString);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }
}

// Export d'une instance singleton
export const logger = new Logger();

