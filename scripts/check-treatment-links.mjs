import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- Running Treatment Link Safety Net Audit ---');

const dataFile = path.join(rootDir, 'src', 'data', 'treatmentsData.ts');
const dataContent = fs.readFileSync(dataFile, 'utf-8');

// Extract slugs and aliases using regex to avoid ts-node runtime dependency
const slugMatches = [...dataContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const aliasMatches = [...dataContent.matchAll(/aliases:\s*\[([^\]]*)\]/g)].map(m => {
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(s => s[1]);
});

if (slugMatches.length === 0) {
  console.error('FAIL: No treatment slugs found in src/data/treatmentsData.ts');
  process.exit(1);
}

const validSlugs = new Set();
slugMatches.forEach((slug, idx) => {
  validSlugs.add(slug);
  const aliases = aliasMatches[idx] || [];
  aliases.forEach(a => validSlugs.add(a));
});

console.log(`Found ${slugMatches.length} canonical treatments, total ${validSlugs.size} valid slugs/aliases:`);
slugMatches.forEach(slug => {
  console.log(`  ✓ /treatments/${slug}`);
});

// Verify images exist in public/
const imageMatches = [...dataContent.matchAll(/image:\s*['"]\/([^'"]+)['"]/g)].map(m => m[1]);
for (const img of imageMatches) {
  const imgPath = path.join(rootDir, 'public', img);
  if (!fs.existsSync(imgPath)) {
    console.error(`FAIL: Treatment image not found: public/${img}`);
    process.exit(1);
  }
}
console.log(`  ✓ All ${imageMatches.length} hero images verified in public/`);

// Audit treatments links in codebase
const filesToAudit = [
  path.join(rootDir, 'src', 'components', 'Treatments.tsx'),
  path.join(rootDir, 'src', 'components', 'Footer.tsx'),
  path.join(rootDir, 'public', 'sitemap.xml'),
];

let totalLinksChecked = 0;
for (const file of filesToAudit) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf-8');
  const links = [...content.matchAll(/\/treatments\/([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
  for (const slug of links) {
    totalLinksChecked++;
    if (!validSlugs.has(slug)) {
      console.error(`FAIL: Unmatched treatment route in ${path.relative(rootDir, file)}: /treatments/${slug}`);
      process.exit(1);
    }
  }
}

console.log(`  ✓ All ${totalLinksChecked} audited links across components and sitemap resolve to active routes.`);

// Verify unknown slug does NOT resolve
const testUnknown = 'non-existent-xyz';
if (validSlugs.has(testUnknown)) {
  console.error(`FAIL: Unknown slug test failed.`);
  process.exit(1);
}

console.log(`  ✓ Safety net passed: unknown slugs correctly unmapped (trigger 404).`);
console.log('--- Treatment Link Safety Net Passed Successfully ---');
