// scripts/run-enquiry-tests.mjs
// Compiles src/lib/enquiry.test.ts + its dependencies with esbuild, then runs.
import { build } from 'esbuild';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const out  = join(__dirname, 'enquiry-test-bundle.cjs');

await build({
  entryPoints: [join(root, 'src/lib/enquiry.test.ts')],
  bundle:   true,
  format:   'cjs',
  platform: 'node',
  outfile:  out,
  // Point the test's config import at the real config file
  resolveExtensions: ['.ts', '.tsx', '.js'],
});

execSync(`node "${out}"`, { stdio: 'inherit' });
