// Bundles the app into ONE self-contained HTML file (works offline, no server needed).
//   node build.mjs          → dist/HOTLINE_MK-II_3D.html
//   node build.mjs --serve  → rebuild on change + http://localhost:8080
import * as esbuild from 'esbuild';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const meta = JSON.parse(await readFile(path.join(here, '..', 'config', 'geometry.json'), 'utf8')).meta;
const out = path.join(here, 'dist', `${meta.nom}_3D.html`);

async function build() {
  const t0 = Date.now();
  const res = await esbuild.build({
    entryPoints: [path.join(here, 'src', 'main.js')],
    bundle: true, minify: true, format: 'iife', target: 'es2020', write: false, legalComments: 'none',
  });
  const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const css = await readFile(path.join(here, 'src', 'ui.css'), 'utf8');
  const html = (await readFile(path.join(here, 'src', 'index.html'), 'utf8'))
    .replace('/*CSS*/', () => css)
    .replace('/*JS*/', () => js);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
  console.log(`✓ ${path.relative(process.cwd(), out)} (${(html.length / 1024).toFixed(0)} Ko, ${Date.now() - t0} ms)`);
}

await rm(path.join(here, 'dist'), { recursive: true, force: true });
await build();

if (process.argv.includes('--serve')) {
  let timer;
  const rebuild = () => { clearTimeout(timer); timer = setTimeout(() => build().catch((e) => console.error(e.message)), 120); };
  watch(path.join(here, 'src'), { recursive: true }, rebuild);
  watch(path.join(here, '..', 'config'), rebuild);
  createServer(async (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(await readFile(out));
  }).listen(8080, () => console.log('→ http://localhost:8080 (Ctrl+C pour arrêter)'));
}
