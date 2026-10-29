// Prüft die neuen Produkttexte und spielt sie per Admin-API ein.
//   node apply.js check   → nur prüfen
//   node apply.js apply   → prüfen + einspielen (nur bestandene Einträge)
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const D = __dirname; const mode = process.argv[2] || 'check';
const data = JSON.parse(fs.readFileSync(path.join(D, 'data.json'), 'utf8'));
const byId = Object.fromEntries(data.map((p) => [p.id, p]));
let rows = [];
for (const f of ['out-1.json', 'out-2.json', 'out-3.json']) {
  const p = path.join(D, f); if (!fs.existsSync(p)) { console.log('fehlt:', f); continue; }
  rows = rows.concat(JSON.parse(fs.readFileSync(p, 'utf8')));
}
const plain = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const norm = (s) => plain(s).replace(/[„“"]/g, '"').toLowerCase();
const BAD = [/bestseller/i, /testsieger/i, /\bnur noch\b/i, /\bentdecke\b/i, /\berlebe\b/i, /unverzichtbar/i, /perfekt für jeden/i, /€\s?\d/, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, /\bneuware\b/i];
const ALLOWED = new Set(['p', 'ul', 'li', 'b', 'small', 'br', 'strong', 'em']);
// Pflicht-Absätze aus dem alten Text, die wörtlich erhalten bleiben müssen
const MUST = /(hersteller|importeur|sonderposten aus lagerauflösung|medizinprodukt|gebrauchsanweisung|zufällig zusammengestellte|mindest-warenwert|kein anspruch auf bestimmte)/i;
const ok = []; const fail = [];
for (const r of rows) {
  const p = byId[r.id]; const errs = [];
  if (!p) { fail.push({ r, errs: ['unbekannte id'] }); continue; }
  const html = String(r.descriptionHtml || '');
  for (const m of html.matchAll(/<\/?([a-z0-9]+)[^>]*>/gi)) if (!ALLOWED.has(m[1].toLowerCase())) errs.push('Tag <' + m[1] + '>');
  if (/style=|href=|<img|<script/i.test(html)) errs.push('Attribute/Links');
  const words = plain(html).split(' ').length; const minW = String(p.beschreibung_alt || '').length < 60 ? 5 : 25; if (words < minW) errs.push('zu kurz (' + words + ' Wörter)');
  for (const b of BAD) if (b.test(plain(html)) && !(b.source.includes('neuware') && /neuware/i.test(p.beschreibung_alt))) errs.push('Floskel/Format: ' + b);
  const oldParas = [...String(p.beschreibung_alt_html || '').matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]).filter((t) => MUST.test(plain(t)));
  for (const t of oldParas) if (!norm(html).includes(norm(t))) errs.push('Pflicht-Text fehlt: ' + plain(t).slice(0, 60));
  const seo = String(r.seo || ''); if (seo.length < 100 || seo.length > 160) errs.push('SEO-Länge ' + seo.length);
  (errs.length ? fail : ok).push({ r, p, errs });
}
console.log(`Einträge: ${rows.length} | bestanden: ${ok.length} | Fehler: ${fail.length} | fehlende Produkte: ${data.filter((p) => !rows.some((r) => r.id === p.id)).map((p) => p.nr).join(',') || 'keine'}`);
for (const f of fail) console.log(' ✘ nr', f.r.nr, f.p ? f.p.handle.slice(0, 30) : '', '→', f.errs.join(' | '));
if (mode !== 'apply') process.exit(0);
const esc = (s) => JSON.stringify(String(s));
for (let i = 0; i < ok.length; i += 8) {
  const part = ok.slice(i, i + 8);
  const q = 'mutation {\n' + part.map((x, k) => `  u${k}: productUpdate(product: { id: ${esc(x.r.id)}, descriptionHtml: ${esc(x.r.descriptionHtml)}, seo: { description: ${esc(x.r.seo)} } }) { product { id } userErrors { field message } }`).join('\n') + '\n}';
  const qf = path.join(D, `m-${i}.graphql`); fs.writeFileSync(qf, q);
  const out = execFileSync('shopify', ['store', 'execute', '-s', 'pvngxm-p2.myshopify.com', '--allow-mutations', '--query-file', qf, '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const j = JSON.parse(out.slice(out.indexOf('{\n')));
  const errs = Object.values(j.data || {}).flatMap((v) => v.userErrors || []);
  console.log(`Paket ${i / 8 + 1}: ${part.length} Produkte`, errs.length ? '✘ ' + JSON.stringify(errs) : '✔', j.errors ? JSON.stringify(j.errors).slice(0, 200) : '');
}
