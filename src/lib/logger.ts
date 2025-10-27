/**
 * Structured logging utility.
 * Logs are output as JSON in production for easy parsing by log aggregators.
 * In development, logs are pretty-printed for readability.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

const isDevelopment = process.env.NODE_ENV !== 'production';

function formatLog(entry: LogEntry): void {
  if (isDevelopment) {
    // Pretty print in development
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    
    console[entry.level === 'debug' ? 'log' : entry.level](
      `${emoji[entry.level]} [${entry.level.toUpperCase()}]`,
      entry.message,
      entry.metadata ? entry.metadata : '',
      entry.error ? entry.error : ''
    );
  } else {
    // JSON output in production
    console[entry.level === 'debug' ? 'log' : entry.level](JSON.stringify(entry));
  }
}

export const logger = {
  debug(message: string, metadata?: Record<string, unknown>): void {
    formatLog({
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      metadata,
    });
  },

  info(message: string, metadata?: Record<string, unknown>): void {
    formatLog({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      metadata,
    });
  },

  warn(message: string, metadata?: Record<string, unknown>): void {
    formatLog({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      metadata,
    });
  },

  error(message: string, error?: unknown, metadata?: Record<string, unknown>): void {
    const errorData: LogEntry['error'] = error instanceof Error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : error
      ? { message: String(error) }
      : undefined;

    formatLog({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      metadata,
      error: errorData,
    });
  },
};
