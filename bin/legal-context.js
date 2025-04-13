#!/usr/bin/env bun
// bin/legal-context.js
import { join } from 'path';

// Find the actual path to the server.ts file
const serverPath = join(__dirname, '../src/server.ts');

// Execute the server with Bun
import(serverPath).catch(err => {
  console.error('Error starting LegalContext:');
  console.error(err);
  process.exit(1);
});
