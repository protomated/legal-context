/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: team@protomated.com
 * Website: protomated.com
 */

/**
 * Path utilities for LegalContext
 *
 * This module provides utility functions for managing file paths,
 * particularly for storing data in the user's home directory.
 */

import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';

// The directory name for storing LegalContext data in the user's home directory
const LEGAL_CONTEXT_DIR = '.legalcontext';

/**
 * Get the path to the LegalContext directory in the user's home directory
 * Creates the directory if it doesn't exist
 */
export function getLegalContextDir(): string {
  const dirPath = join(homedir(), LEGAL_CONTEXT_DIR);

  // Create the directory if it doesn't exist
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
}

/**
 * Get the path to a file in the LegalContext directory
 * @param fileName The name of the file
 * @returns The full path to the file
 */
export function getLegalContextFilePath(fileName: string): string {
  return join(getLegalContextDir(), fileName);
}
