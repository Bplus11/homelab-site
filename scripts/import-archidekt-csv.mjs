// scripts/import-archidekt-csv.mjs
//
// Archidekt doesn't offer a public, CORS-friendly "collection" API endpoint you can
// fetch directly from a static site, so the reliable path is:
//
//   1. Go to https://archidekt.com/collections (your collection page)
//   2. Use the "Export" option to download your collection as CSV
//   3. Run:  node scripts/import-archidekt-csv.mjs path/to/your-export.csv
//
// This rewrites src/data/mtg-collection.json. Re-run any time you update your
// collection on Archidekt and re-export.

import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node scripts/import-archidekt-csv.mjs <path-to-csv>');
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf-8');

// Minimal CSV parser (handles quoted fields with commas inside them)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n' || char === '\r') {
        if (field.length > 0 || row.length > 0) {
          row.push(field);
          rows.push(row);
          row = [];
          field = '';
        }
        // skip \r\n pairs
        if (char === '\r' && next === '\n') i++;
      } else {
        field += char;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const rows = parseCSV(raw);
const header = rows[0].map((h) => h.trim().toLowerCase());
const dataRows = rows.slice(1).filter((r) => r.length > 1);

// Archidekt's collection CSV export typically includes columns like:
// Quantity, Name, Edition / Set, Condition, Foil, Tags, ...
// Column names can shift slightly between export versions, so we match loosely.
function col(row, ...candidates) {
  for (const name of candidates) {
    const idx = header.indexOf(name);
    if (idx !== -1) return row[idx]?.trim() ?? '';
  }
  return '';
}

const cards = dataRows.map((row) => {
  const quantity = parseInt(col(row, 'quantity', 'qty'), 10) || 1;
  const foilRaw = col(row, 'foil').toLowerCase();
  return {
    name: col(row, 'name', 'card name'),
    set: col(row, 'edition', 'edition name', 'set', 'set name'),
    quantity,
    foil: foilRaw === 'foil' || foilRaw === 'true' || foilRaw === 'yes',
    condition: col(row, 'condition') || 'Unknown',
    tags: col(row, 'tags')
      ? col(row, 'tags').split(/[;|]/).map((t) => t.trim()).filter(Boolean)
      : []
  };
}).filter((c) => c.name);

const outPath = path.join(process.cwd(), 'src', 'data', 'mtg-collection.json');
fs.writeFileSync(outPath, JSON.stringify(cards, null, 2));

console.log(`Imported ${cards.length} card entries into ${outPath}`);
