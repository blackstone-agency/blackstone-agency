// Baut die verkleinerten Theme-Dateien aus den lesbaren Quellen:
//   node kunden/schnappy-src/build.js   (benötigt: npm i csso@5 terser@5)
const fs = require('fs'); const path = require('path');
const NM = process.env.NODE_PATH_MIN || path.join(__dirname, 'node_modules');
const csso = require(require.resolve('csso', { paths: [NM, __dirname] }));
const terser = require(require.resolve('terser', { paths: [NM, __dirname] }));
const T = path.join(__dirname, '..', 'schnappy-theme', 'assets');
(async () => {
  require('./purge.js'); const css = fs.readFileSync(path.join(__dirname, 'schnappy.purged.css'), 'utf8');
  const min = csso.minify(css, { restructure: false, comments: false }).css;
  fs.writeFileSync(path.join(T, 'schnappy.css'), '/* Schnappy Theme – Quelle: kunden/schnappy-src/schnappy.css */\n' + min);
  const js = fs.readFileSync(path.join(__dirname, 'schnappy.js'), 'utf8');
  const out = await terser.minify(js, { compress: { passes: 1 }, mangle: true, format: { comments: false } });
  fs.writeFileSync(path.join(T, 'schnappy.js'), '/* Schnappy Theme – Quelle: kunden/schnappy-src/schnappy.js */\n' + out.code);
  console.log('css', css.length, '→', min.length, ' js', js.length, '→', out.code.length);
})();
