import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import { runTests } from './runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testDir = __dirname;

const testFiles = readdirSync(testDir)
  .filter(f => f.endsWith('.test.js'))
  .map(f => `./${f}`);

const allPassed = await runTests(testFiles);

process.exit(allPassed ? 0 : 1);
