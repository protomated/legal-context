/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Logger module for LegalContext
 * 
 * This module provides a simple logging utility with different log levels
 * based on the configured LOG_LEVEL environment variable.
 * 
 * IMPORTANT: When using stdio transport with MCP, all stdout is reserved for
 * MCP protocol messages. Therefore, we redirect all logging to stderr to avoid
 * interfering with the MCP communication.
 */

import { config } from './config';

// Log levels in order of verbosity
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Current log level from config
const currentLevel = LOG_LEVELS[config.logLevel];

/**
 * Logger class with methods for different log levels
 * All output goes to stderr to avoid interfering with MCP stdio communication
 */
class Logger {
  /**
   * Log a debug message (most verbose)
   */
  debug(message: string, ...args: any[]): void {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    if (currentLevel <= LOG_LEVELS.info) {
      console.error(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.error(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log an error message (least verbose)
   */
  error(message: string, ...args: any[]): void {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

// Export a singleton instance
export const logger = new Logger();
