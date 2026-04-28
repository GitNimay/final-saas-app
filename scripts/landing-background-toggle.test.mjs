import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('landing background effect is controlled by a default-off toggle', () => {
  assert.match(
    appSource,
    /const\s+\[showLandingBackgroundEffect,\s*setShowLandingBackgroundEffect\]\s*=\s*useState\(false\)/,
  );

  assert.match(
    appSource,
    /aria-pressed=\{showLandingBackgroundEffect\}/,
  );

  assert.match(
    appSource,
    /setShowLandingBackgroundEffect\(\(isShown\)\s*=>\s*!isShown\)/,
  );

  assert.match(
    appSource,
    /\{showLandingBackgroundEffect\s*&&\s*\(/,
  );
});

test('landing effect toggle has a subtle continuous white perimeter animation', () => {
  assert.match(appSource, /effect-orbit-button/);
  assert.match(indexSource, /\.effect-orbit-button::before/);
  assert.match(indexSource, /@keyframes\s+effectOrbitLine/);
  assert.match(indexSource, /animation:\s*effectOrbitLine\s+[0-9.]+s\s+linear\s+infinite/);
  assert.match(indexSource, /conic-gradient\([^)]*rgba\(255,\s*255,\s*255/);
  assert.match(indexSource, /prefers-reduced-motion:\s*reduce[\s\S]*\.effect-orbit-button::before[\s\S]*animation:\s*none/);
});
