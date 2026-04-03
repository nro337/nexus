/**
 * Reads the Lighthouse CI manifest and emits shields.io endpoint JSON files
 * for each audited category so README badges stay up to date after every run.
 *
 * Output: lighthouse/badges/{performance,accessibility,best-practices,seo}.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const REPORTS_DIR = './lighthouse/reports';
const BADGES_DIR = './lighthouse/badges';

function getColor(score) {
  if (score >= 0.9) return 'brightgreen';
  if (score >= 0.8) return 'green';
  if (score >= 0.7) return 'yellow';
  if (score >= 0.5) return 'orange';
  return 'red';
}

function labelFor(key) {
  return key === 'best-practices' ? 'best practices' : key;
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(join(REPORTS_DIR, 'manifest.json'), 'utf8'));
} catch {
  console.error(`Could not read ${REPORTS_DIR}/manifest.json — skipping badge generation.`);
  process.exit(1);
}

// Use the representative run (or fall back to the first entry)
const entry = manifest.find((r) => r.isRepresentativeRun) ?? manifest[0];
if (!entry) {
  console.error('Manifest contains no runs — skipping badge generation.');
  process.exit(1);
}

const summary = entry.summary;
if (!summary) {
  console.error('Manifest entry has no summary — skipping badge generation.');
  process.exit(1);
}

mkdirSync(BADGES_DIR, { recursive: true });

for (const [key, score] of Object.entries(summary)) {
  const pct = Math.round(score * 100);
  const badge = {
    schemaVersion: 1,
    label: `lighthouse ${labelFor(key)}`,
    message: `${pct}/100`,
    color: getColor(score),
    namedLogo: 'lighthouse',
  };
  const outPath = join(BADGES_DIR, `${key}.json`);
  writeFileSync(outPath, JSON.stringify(badge, null, 2) + '\n');
  console.log(`Wrote ${outPath}  (${pct}/100)`);
}

console.log('Badge data generation complete.');
