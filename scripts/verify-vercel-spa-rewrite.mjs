import { readFile } from 'node:fs/promises';

const configPath = new URL('../vercel.json', import.meta.url);

let config;
try {
  config = JSON.parse(await readFile(configPath, 'utf8'));
} catch (error) {
  throw new Error(`vercel.json must exist and contain valid JSON: ${error.message}`);
}

const rewrite = config.rewrites?.find(
  (entry) => entry?.source === '/(.*)' && entry?.destination === '/index.html',
);

if (!rewrite) {
  throw new Error('vercel.json must rewrite all SPA routes from "/(.*)" to "/index.html".');
}

console.log('Vercel SPA rewrite is configured.');
