// Assemble l'Atlas de l'Univers en un seul fichier HTML autonome : node atlas-univers-src/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const lire = f => readFileSync(join(ici, f), 'utf8');
const scripts = ['util', 'astro', 'savoir', 'schemas', 'moteur3d', 'ciel', 'systeme', 'cosmos', 'demos', 'fee', 'app']
  .map(n => `// ===== ${n}.js =====\n${lire(`js/${n}.js`)}`).join('\n');
const proteger = s => s.replace(/<\/script/gi, '<\\/script');
const page = lire('index.html')
  .replace('/*STYLE*/', () => lire('style.css'))
  .replace('/*DONNEES*/', () => `const CIEL = ${lire('donnees/ciel.json').trim()};`)
  .replace('/*SCRIPTS*/', () => proteger(scripts));
const sortie = join(ici, '..', 'atlas-univers');
mkdirSync(sortie, { recursive: true });
writeFileSync(join(sortie, 'index.html'), page);
console.log(`atlas-univers/index.html : ${(Buffer.byteLength(page) / 1024).toFixed(0)} Ko`);
