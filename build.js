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
 * Build script for LegalContext
 * 
 * This script builds the project for distribution, including:
 * - Transpiling TypeScript files to JavaScript
 * - Copying necessary files to the dist directory
 * - Creating a bin file for CLI usage
 */

import { $ } from 'bun';
import fs from 'fs';
import path from 'path';

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Ensure bin directory exists
if (!fs.existsSync('bin')) {
  fs.mkdirSync('bin');
}

console.log('Building LegalContext...');

try {
  // Build the main server
  console.log('Transpiling TypeScript files...');
  await $`bun build ./src/server.ts --outdir ./dist --target=node`;
  
  // Create CLI bin file
  console.log('Creating CLI bin file...');
  const binContent = `#!/usr/bin/env bun
require('../dist/server.js');`;
  
  fs.writeFileSync('bin/legal-context.js', binContent);
  fs.chmodSync('bin/legal-context.js', '755');
  
  // Copy necessary files
  console.log('Copying necessary files...');
  fs.copyFileSync('README.md', 'dist/README.md');
  fs.copyFileSync('LICENSE', 'dist/LICENSE');
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
