#!/usr/bin/env node
'use strict';
// Traces brand/xnk-mark-source.png (white X mark on transparent) into a clean vector: logo.svg, logo-dark.svg.
// No dependencies besides ImageMagick (`convert`). The mark is made of straight edges, so it is traced as polygons
// (marching along pixel edges, then Douglas-Peucker simplification).
//   node tools/trace-logo.js

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'brand', 'xnk-mark-source.png');
const SCALE = 1;       // trace at full size
const EPS = 4;         // simplification tolerance in px (the mark is straight-edged)

function readAlpha() {
  const info = execFileSync('convert', [SRC, '-alpha', 'extract', '-format', '%@', 'info:']).toString();   // WxH+X+Y
  const m = info.match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/);
  if (!m) throw new Error('bbox: ' + info);
  const box = { w: +m[1], h: +m[2], x: +m[3], y: +m[4] };
  const w = Math.round(box.w * SCALE), h = Math.round(box.h * SCALE);
  const raw = execFileSync('convert', [SRC, '-alpha', 'extract', '-crop', box.w + 'x' + box.h + '+' + box.x + '+' + box.y, '+repage',
    '-filter', 'Lanczos', '-resize', w + 'x' + h + '!', '-depth', '8', 'gray:-'], { maxBuffer: 1 << 26 });
  return { box, w, h, data: raw };
}

// Boundary edges between inside/outside pixels, as directed unit segments with the inside on the left.
function loops(grid, w, h) {
  const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h && grid[y * w + x] > 127;
  const next = new Map();   // "x,y" -> [[x2,y2], ...]
  const add = (a, b) => { const k = a[0] + ',' + a[1]; (next.get(k) || next.set(k, []).get(k)).push(b); };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!inside(x, y)) continue;
    if (!inside(x, y - 1)) add([x, y], [x + 1, y]);
    if (!inside(x + 1, y)) add([x + 1, y], [x + 1, y + 1]);
    if (!inside(x, y + 1)) add([x + 1, y + 1], [x, y + 1]);
    if (!inside(x - 1, y)) add([x, y + 1], [x, y]);
  }
  const out = [];
  for (const [k, list] of next) {
    while (list.length) {
      const start = k.split(',').map(Number);
      const pts = [start];
      let cur = list.pop();
      while (cur[0] !== start[0] || cur[1] !== start[1]) {
        pts.push(cur);
        const l = next.get(cur[0] + ',' + cur[1]);
        if (!l || !l.length) throw new Error('open contour');
        cur = l.pop();
      }
      out.push(pts);
    }
  }
  return out;
}

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let dmax = 0, idx = 0;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax <= eps) return [a, b];
  return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
}

// Closed loop simplification: split at the two farthest points so the seam is not special.
function simplifyClosed(pts, eps) {
  let i0 = 0, best = -1;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]); if (d > best) { best = d; i0 = i; } }
  const a = pts.slice(0, i0 + 1), b = pts.slice(i0).concat([pts[0]]);
  return rdp(a, eps).slice(0, -1).concat(rdp(b, eps).slice(0, -1));
}

// Edges that are meant to be flat or upright (within a few px) are made exactly flat or upright.
function snap(p, tol) {
  const q = p.map(v => v.slice());
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < q.length; i++) {
    const a = q[i], b = q[(i + 1) % q.length];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    if (Math.abs(dy) <= tol && Math.abs(dx) > tol * 4) { const y = (a[1] + b[1]) / 2; a[1] = y; b[1] = y; }
    else if (Math.abs(dx) <= tol && Math.abs(dy) > tol * 4) { const x = (a[0] + b[0]) / 2; a[0] = x; b[0] = x; }
  }
  return q;
}

function area(p) { let s = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; s += p[i][0] * q[1] - q[0] * p[i][1]; } return s / 2; }

function main() {
  const { box, w, h, data } = readAlpha();
  const polys = loops(data, w, h).map(l => snap(simplifyClosed(l, EPS), 9)).filter(p => p.length >= 3 && Math.abs(area(p)) > 20);
  const f = 1 / SCALE, r = n => Math.round(n * f * 10) / 10;
  const d = polys.map(p => 'M' + p.map(q => r(q[0]) + ' ' + r(q[1])).join('L') + 'Z').join('');
  const vb = '0 0 ' + box.w + ' ' + box.h;
  const svg = fill => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" role="img" aria-label="XNK"><path fill="' + fill + '" fill-rule="evenodd" d="' + d + '"/></svg>\n';
  fs.writeFileSync(path.join(ROOT, 'logo.svg'), svg('#FFFFFF'));
  fs.writeFileSync(path.join(ROOT, 'logo-dark.svg'), svg('#0B0B0B'));
  fs.writeFileSync(path.join(ROOT, 'brand', 'mark.json'), JSON.stringify({ viewBox: vb, width: box.w, height: box.h, d: d }, null, 2) + '\n');
  console.log('Titik: ' + polys.reduce((n, p) => n + p.length, 0) + ' di ' + polys.length + ' bentuk, viewBox ' + vb);
}

if (require.main === module) main();
module.exports = { rdp, simplifyClosed, loops };
