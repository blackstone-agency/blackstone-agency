// Entfernt CSS-Regeln, deren Selektoren nur noch nicht mehr verwendete „sn-“-Klassen enthalten.
const fs = require('fs'); const path = require('path');
const NM = process.env.NODE_PATH_MIN || path.join(__dirname, 'node_modules');
const csso = require(require.resolve('csso', { paths: [NM, __dirname] }));
const { syntax } = csso;
const T = path.join(__dirname, '..', 'schnappy-theme');
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(liquid|json)$/.test(f)) files.push(p); } })(T);
let corpus = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n') + fs.readFileSync(path.join(__dirname, 'schnappy.js'), 'utf8');
const used = (cls) => corpus.includes(cls);
const src = fs.readFileSync(path.join(__dirname, 'schnappy.css'), 'utf8');
const ast = syntax.parse(src);
let removed = 0;
syntax.walk(ast, { visit: 'Rule', enter(node, item, list) {
  if (!list || node.prelude.type !== 'SelectorList') return;
  const sels = node.prelude.children.toArray();
  const keep = sels.filter((sel) => { let ok = true; syntax.walk(sel, { visit: 'ClassSelector', enter(c) { if (c.name.startsWith('sn-') && !used(c.name.replace(/(__|--).*/, '')) && !used(c.name)) ok = false; } }); return ok; });
  if (keep.length === 0) { list.remove(item); removed++; }
  else if (keep.length < sels.length) { node.prelude.children.forEach((sel, it, lst) => { if (!keep.includes(sel)) lst.remove(it); }); }
} });
const out = syntax.generate(ast);
fs.writeFileSync(path.join(__dirname, 'schnappy.purged.css'), out);
console.log('Regeln entfernt:', removed, src.length, '→', out.length);
