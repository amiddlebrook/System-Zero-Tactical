import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

assert.ok(existsSync('dist/index.html'), 'Built entrypoint is missing');
const html = readFileSync('dist/index.html', 'utf8');
const assets = readdirSync('dist/assets');
assert.ok(assets.some(name => name.endsWith('.js')), 'JavaScript bundle is missing');
assert.ok(assets.some(name => name.endsWith('.css')), 'CSS bundle is missing');
assert.match(html, /<div id="root"><\/div>/, 'React mount element is missing');
assert.ok(!/cdn\.tailwindcss|aistudiocdn|GEMINI_API_KEY/i.test(html), 'External runtime CDN or leaked key configuration detected');
for (const name of assets.filter(name => name.endsWith('.js') || name.endsWith('.css'))) {
  assert.ok(statSync(join('dist/assets', name)).size > 0, 'Empty asset: ' + name);
}
console.log('Static asset smoke checks passed.');
