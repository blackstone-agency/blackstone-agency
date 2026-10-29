// Baut aus produkte.json eine Shopify-Importdatei und bereitet die Fotos auf.
//   node kunden/schnappy-inventar/csv.js [produkte.json]
// Fotos: aus ~/Desktop/Schnappy-Inventar/Fotos (Dateiname reicht), werden quadratisch (1600 px,
// weißer Rand), als JPG nach bilder/ gelegt und per Repo-URL in die CSV geschrieben.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const SRC = path.resolve(process.argv[2] || path.join(DIR, 'produkte.json'));
const FOTOS = process.env.FOTOS || path.join(os.homedir(), 'Desktop', 'Schnappy-Inventar', 'Fotos');
const BILDER = path.join(DIR, 'bilder');
const RAW = 'https://raw.githubusercontent.com/blackstone-agency/blackstone-agency/main/kunden/schnappy-inventar/bilder/';
const SIZE = 1600;

const COLS = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Option1 Linked To', 'Option2 Name', 'Option2 Value', 'Option2 Linked To', 'Option3 Name', 'Option3 Value', 'Option3 Linked To', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty',
  'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode', 'Unit Price Total Measure',
  'Unit Price Total Measure Unit', 'Unit Price Base Measure', 'Unit Price Base Measure Unit',
  'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card', 'SEO Title', 'SEO Description', 'Variant Weight Unit', 'Status'];

const cell = (v) => {
  if (v === undefined || v === null) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const money = (n) => (n === undefined || n === null || n === '' ? '' : Number(n).toFixed(2));
const slug = (t) => String(t).toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
const plain = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function foto(datei, handle, n) {
  const quelle = path.isAbsolute(datei) ? datei : path.join(FOTOS, datei);
  if (!fs.existsSync(quelle)) throw new Error('Foto fehlt: ' + quelle);
  const ziel = path.join(BILDER, `${handle}-${n}.jpg`);
  if (!fs.existsSync(ziel)) {
    const tmp = path.join(os.tmpdir(), `sn-${process.pid}-${n}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', String(SIZE), quelle, '--out', tmp], { stdio: 'ignore' });
    execFileSync('sips', ['-p', String(SIZE), String(SIZE), '--padColor', 'FFFFFF', tmp, '--out', ziel], { stdio: 'ignore' });
    fs.rmSync(tmp, { force: true });
  }
  return RAW + encodeURIComponent(path.basename(ziel));
}

const produkte = JSON.parse(fs.readFileSync(SRC, 'utf8'));
fs.mkdirSync(BILDER, { recursive: true });
const rows = [COLS.join(',')];
const fehler = [];
const handles = new Set();
let ok = 0;

for (const p of produkte) {
  const handle = p.handle || slug(p.titel);
  if (handles.has(handle)) { fehler.push('Doppelter Handle: ' + handle); continue; }
  handles.add(handle);
  if (!p.titel || !(p.preis > 0)) { fehler.push(handle + ': Titel oder Preis fehlt'); continue; }
  if (p.uvp && !(p.uvp > p.preis)) fehler.push(handle + ': UVP muss höher als der Preis sein (sonst weglassen)');
  let bilder = [];
  try { bilder = (p.fotos || []).map((f, i) => foto(f, handle, i + 1)); } catch (e) { fehler.push(handle + ': ' + e.message); continue; }
  const gp = p.grundpreis || {};
  const first = {
    Handle: handle, Title: p.titel, 'Body (HTML)': p.beschreibung || '', Vendor: p.marke || 'Schnappy',
    Type: p.typ || '', Tags: (p.tags || []).join(', '), Published: p.status === 'draft' ? 'FALSE' : 'TRUE',
    'Option1 Name': 'Title', 'Option1 Value': 'Default Title', 'Variant SKU': p.sku || '',
    'Variant Grams': p.gramm || '', 'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': p.menge ?? '',
    'Variant Inventory Policy': 'deny', 'Variant Fulfillment Service': 'manual',
    'Variant Price': money(p.preis), 'Variant Compare At Price': money(p.uvp),
    'Variant Requires Shipping': 'TRUE', 'Variant Taxable': 'TRUE', 'Variant Barcode': p.ean || '',
    'Unit Price Total Measure': gp.menge || '', 'Unit Price Total Measure Unit': gp.menge ? gp.einheit : '',
    'Unit Price Base Measure': gp.menge ? (gp.basis || 100) : '', 'Unit Price Base Measure Unit': gp.menge ? (gp.basiseinheit || gp.einheit) : '',
    'Image Src': bilder[0] || '', 'Image Position': bilder[0] ? 1 : '', 'Image Alt Text': bilder[0] ? (p.alt || p.titel) : '',
    'Gift Card': 'FALSE', 'SEO Title': (p.seoTitel || p.titel + ' – Schnappy').slice(0, 70),
    'SEO Description': (p.seoText || plain(p.beschreibung)).slice(0, 160), 'Variant Weight Unit': 'g',
    Status: p.status === 'draft' ? 'draft' : 'active',
  };
  rows.push(COLS.map((c) => cell(first[c])).join(','));
  ok++;
  bilder.slice(1).forEach((src, i) => {
    const r = { Handle: handle, 'Image Src': src, 'Image Position': i + 2, 'Image Alt Text': p.alt || p.titel };
    rows.push(COLS.map((c) => cell(r[c])).join(','));
  });
}

const out = path.join(DIR, 'import.csv');
fs.writeFileSync(out, rows.join('\n') + '\n');
console.log(`${ok} Produkte → ${path.relative(process.cwd(), out)}`);
if (fehler.length) { console.log('Bitte prüfen:\n- ' + fehler.join('\n- ')); process.exitCode = 1; }
