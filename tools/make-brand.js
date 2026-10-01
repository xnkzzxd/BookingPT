#!/usr/bin/env node
'use strict';
// Builds every logo / favicon / icon / manifest file from the real XNK mark.
//   1. node tools/trace-logo.js     (logo.svg, logo-dark.svg, brand/mark.json)
//   2. node tools/make-brand.js     (this file)
// Needs ImageMagick (`convert`). Sources live in brand/: the mark (white on transparent) and the two app icons.

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const B = f => path.join(ROOT, 'brand', f);
const R = f => path.join(ROOT, f);
// Always real RGB/RGBA PNGs (ImageMagick would otherwise write grayscale, which some old tools mishandle).
const OPAQUE = ['icon-maskable-512.png', 'apple-touch-icon.png', 'mstile-150x150.png'];
const cv = args => {
  const out = args[args.length - 1];
  const type = path.basename(out).endsWith('.png') ? (OPAQUE.includes(path.basename(out)) ? '2' : '6') : null;
  return execFileSync('convert', type ? args.slice(0, -1).concat(['-define', 'png:color-type=' + type, out]) : args);
};
const mark = JSON.parse(fs.readFileSync(B('mark.json'), 'utf8'));

const INK = '#0B0B0B', PAPER = '#ECECEC';

function pngs() {
  const icon = B('icon-512-source.png'), maskable = B('icon-maskable-512-source.png'), src = B('xnk-mark-source.png');
  cv([icon, R('icon-512.png')]);
  cv([icon, '-filter', 'Lanczos', '-resize', '192x192', R('icon-192.png')]);
  cv([maskable, R('icon-maskable-512.png')]);
  cv([maskable, '-filter', 'Lanczos', '-resize', '180x180', '-background', INK, '-alpha', 'remove', '-alpha', 'off', R('apple-touch-icon.png')]);
  cv([maskable, '-filter', 'Lanczos', '-resize', '150x150', R('mstile-150x150.png')]);
  cv([icon, R('logo-512.png')]);
  for (const n of [16, 32, 48]) cv([icon, '-filter', 'Lanczos', '-resize', n + 'x' + n, R('favicon-' + n + 'x' + n + '.png')]);
  cv([R('favicon-16x16.png'), R('favicon-32x32.png'), R('favicon-48x48.png'), R('favicon.ico')]);
  // white mark on transparent, and the same in black, centred on a 512 square with breathing room
  cv([src, '-trim', '+repage', '-filter', 'Lanczos', '-resize', '400x400', '-background', 'none', '-gravity', 'center', '-extent', '512x512', R('logo.png')]);
  cv([R('logo.png'), '-channel', 'RGB', '-negate', '+channel', R('logo-dark.png')]);
}

function svgs() {
  // 512 square, same proportions as icon-512.png: the mark spans about 69% of the width.
  const k = 355 / mark.width, tx = (512 - mark.width * k) / 2, ty = (512 - mark.height * k) / 2;
  const t = 'translate(' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ') scale(' + k.toFixed(4) + ')';
  fs.writeFileSync(R('favicon.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#111111"/>' +
    '<path transform="' + t + '" fill="#FFFFFF" fill-rule="evenodd" d="' + mark.d + '"/></svg>\n');
  fs.writeFileSync(R('safari-pinned-tab.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + mark.viewBox + '"><path fill="#000000" fill-rule="evenodd" d="' + mark.d + '"/></svg>\n');
}

function configs() {
  fs.writeFileSync(R('browserconfig.xml'),
    '<?xml version="1.0" encoding="utf-8"?>\n<browserconfig><msapplication><tile><square150x150logo src="/mstile-150x150.png"/><TileColor>' + INK + '</TileColor></tile></msapplication></browserconfig>\n');
  fs.writeFileSync(R('site.webmanifest'), JSON.stringify({
    id: '/',
    name: 'XNK Personal Training',
    short_name: 'XNK',
    description: 'Personal trainer Purwokerto & Banjarnegara: Coach Jizdan. Lihat harga, jadwal kosong, dan booking sesi latihan.',
    lang: 'id',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: PAPER,
    theme_color: INK,
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
    ],
    shortcuts: [
      // shortcut URLs must stay inside the manifest scope (the booking portal is another origin, so it is not listed)
      { name: 'Harga & paket', short_name: 'Harga', url: '/harga/', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }] },
      { name: 'Personal trainer Purwokerto', short_name: 'Purwokerto', url: '/personal-trainer-purwokerto/', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }] },
      { name: 'Tentang Coach Jizdan', short_name: 'Tentang', url: '/tentang/', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }] }
    ]
  }, null, 2) + '\n');
}

function main() {
  pngs(); svgs(); configs();
  console.log('Brand: logo, favicon, ikon, manifest selesai.');
}

if (require.main === module) main();
