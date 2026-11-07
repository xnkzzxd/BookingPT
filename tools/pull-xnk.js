'use strict';
// Pulls a published build of the XNK app (Phase AAA, pull-based publishing) into a folder of this repo.
//   node tools/pull-xnk.js <folder-on-xnk.my.id> <target dir>        e.g.  client .   |   landing-pub l
// It reads <base>/<folder>/manifest.json, downloads every file, checks its sha256, and only then replaces the target's
// files. Files that were pulled before and are no longer listed are removed (kept in .xnk-pulled.json). Public data only.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const BASE = process.env.XNK_BASE || 'https://xnk.my.id';

async function get(url) {
  const r = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
  if (!r.ok) throw new Error(url + ' -> HTTP ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

async function main() {
  const [folder, target] = process.argv.slice(2);
  if (!folder || !target) throw new Error('usage: pull-xnk.js <folder> <target dir>');
  const m = JSON.parse((await get(`${BASE}/${folder}/manifest.json`)).toString('utf8'));
  if (m.v !== 1 || !m.files || !m.files['index.html']) throw new Error('unexpected manifest');
  const got = {};
  for (const [name, sha] of Object.entries(m.files)) {
    if (!/^[A-Za-z0-9._-]+$/.test(name)) throw new Error('bad file name in manifest: ' + name);
    const buf = await get(`${BASE}/${folder}/${name}`);
    if (crypto.createHash('sha256').update(buf).digest('hex') !== sha) throw new Error('checksum mismatch: ' + name);
    got[name] = buf;
  }
  fs.mkdirSync(target, { recursive: true });
  const stateFile = path.join(target, '.xnk-pulled.json');
  let old = [];
  try { old = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch (e) { /* first run */ }
  for (const [name, buf] of Object.entries(got)) fs.writeFileSync(path.join(target, name), buf);
  for (const name of old) if (!(name in got) && /^[A-Za-z0-9._-]+$/.test(name)) fs.rmSync(path.join(target, name), { force: true });
  fs.writeFileSync(stateFile, JSON.stringify(Object.keys(got).sort(), null, 1) + '\n');
  console.log(`pulled ${Object.keys(got).length} files from ${folder} into ${target}`);
}
main().catch(e => { console.error(e.message); process.exit(1); });
