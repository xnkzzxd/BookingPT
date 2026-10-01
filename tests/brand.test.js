'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { build } = require('../tools/build.js');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f));
const png = f => { const b = read(f); assert.equal(b.slice(1, 4).toString(), 'PNG', f + ' is a PNG'); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), colorType: b[25] }; };

test('PNG icons exist at the right pixel size, as real RGB/RGBA', () => {
  const sizes = { 'favicon-16x16.png': 16, 'favicon-32x32.png': 32, 'favicon-48x48.png': 48, 'icon-192.png': 192, 'icon-512.png': 512, 'icon-maskable-512.png': 512,
    'apple-touch-icon.png': 180, 'mstile-150x150.png': 150, 'logo.png': 512, 'logo-dark.png': 512, 'logo-512.png': 512 };
  for (const [f, n] of Object.entries(sizes)) {
    const p = png(f);
    assert.deepEqual([p.w, p.h], [n, n], f);
    assert.ok([2, 6].includes(p.colorType), f + ' colour type ' + p.colorType);
  }
  for (const f of ['apple-touch-icon.png', 'icon-maskable-512.png', 'mstile-150x150.png']) assert.equal(png(f).colorType, 2, f + ' has no transparency');
});

test('favicon.ico holds 16, 32 and 48 px images (48 is what Google asks for)', () => {
  const d = read('favicon.ico');
  assert.equal(d.readUInt16LE(2), 1, 'ICO type');
  const n = d.readUInt16LE(4);
  assert.deepEqual(Array.from({ length: n }, (_, i) => d[6 + 16 * i] || 256).sort((a, b) => a - b), [16, 32, 48]);
});

test('SVG files: logo (white and dark), favicon, pinned tab share one traced path with few points', () => {
  const mark = JSON.parse(read('brand/mark.json'));
  assert.ok(mark.d.length > 100 && mark.d.length < 1500, 'a clean polygon path, not a pixel staircase');
  for (const f of ['logo.svg', 'logo-dark.svg', 'favicon.svg', 'safari-pinned-tab.svg']) {
    const s = read(f).toString();
    assert.ok(s.startsWith('<svg') && s.includes(mark.d), f);
  }
  assert.ok(read('logo.svg').toString().includes('#FFFFFF') && read('logo-dark.svg').toString().includes('#0B0B0B'));
  assert.ok(read('favicon.svg').toString().includes('rx="112"'));
});

test('manifest: valid, every icon exists with the declared size, maskable present, shortcuts inside the scope', () => {
  const m = JSON.parse(read('site.webmanifest'));
  for (const k of ['id', 'name', 'short_name', 'start_url', 'scope', 'display', 'theme_color', 'background_color', 'icons']) assert.ok(m[k], k);
  assert.ok(m.icons.some(i => i.purpose === 'maskable'));
  for (const i of m.icons) {
    assert.ok(fs.existsSync(path.join(ROOT, i.src.replace(/^\//, ''))), i.src);
    if (/^\d+x\d+$/.test(i.sizes)) { const [w] = i.sizes.split('x').map(Number); assert.equal(png(i.src.replace(/^\//, '')).w, w, i.src); }
  }
  for (const sc of m.shortcuts) assert.ok(sc.url.startsWith('/'), 'shortcut stays in scope: ' + sc.url);
  assert.ok(read('browserconfig.xml').toString().includes('mstile-150x150.png'));
});

test('every generated page and the home page link the full icon set and the manifest, with the real mark (no chevron)', () => {
  const INDEX = read('index.html').toString();
  const PAKET = JSON.parse(read('data/paket.json'));
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  const mark = JSON.parse(read('brand/mark.json'));
  for (const [f, h] of Object.entries(out)) {
    if (!f.endsWith('.html')) continue;
    for (const needle of ['href="/favicon.svg"', 'href="/favicon.ico"', 'href="/favicon-32x32.png"', 'href="/apple-touch-icon.png"', 'href="/site.webmanifest"', 'href="/safari-pinned-tab.svg"', '/browserconfig.xml'])
      assert.ok(h.includes(needle), f + ' links ' + needle);
    assert.ok(h.includes(mark.d), f + ' draws the real X mark');
    assert.ok(!h.includes('M7 11l5-5 5 5'), f + ' has no chevron');
  }
});

test('structured data: logo is an ImageObject of an existing 512 px file, image list includes it', () => {
  const INDEX = read('index.html').toString();
  const out = build({ index: INDEX, paket: JSON.parse(read('data/paket.json')), kelas: [], lokasi: {} });
  const blocks = [...out['index.html'].matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
  const biz = blocks.find(b => b['@type'] === 'ProfessionalService');
  assert.equal(biz.logo['@type'], 'ImageObject');
  assert.equal(biz.logo.url, 'https://xnkbooking.my.id/logo-512.png');
  assert.ok(fs.existsSync(path.join(ROOT, 'logo-512.png')));
  assert.ok(biz.logo.width >= 112 && biz.image.includes(biz.logo.url));
});
