// src/utils/logger.ts
// Simple logger that writes to stderr

/**
 * Log level names
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger interface
 */
export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, error?: Error) => void;
}

/**
 * Create a logger that writes to stderr
 * 
 * @param namespace - The namespace for the logger
 * @returns A logger instance
 */
export function createLogger(namespace: string): Logger {
  return {
    debug: (message: string, ...args: any[]) => {
      process.stderr.write(`[${namespace}] [debug] ${message}\n`);
      if (args.length > 0) {
        process.stderr.write(`${JSON.stringify(args, null, 2)}\n`);
      }
    },
    
    info: (message: string, ...args: any[]) => {
      process.stderr.write(`[${namespace}] [info] ${message}\n`);
      if (args.length > 0) {
        process.stderr.write(`${JSON.stringify(args, null, 2)}\n`);
      }
    },
    
    warn: (message: string, ...args: any[]) => {
      process.stderr.write(`[${namespace}] [warn] ${message}\n`);
      if (args.length > 0) {
        process.stderr.write(`${JSON.stringify(args, null, 2)}\n`);
      }
    },
    
    error: (message: string, error?: Error) => {
      process.stderr.write(`[${namespace}] [error] ${message}\n`);
      if (error) {
        process.stderr.write(`[${namespace}] [error] ${error.stack || error.message}\n`);
      }
    }
  };
}
