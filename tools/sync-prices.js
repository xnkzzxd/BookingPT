#!/usr/bin/env node
'use strict';
// Pulls the public package list from the Apps Script web app (Google Sheet = master) into data/paket.json.
// Only whitelisted public fields are kept. updatedAt moves only when the content actually changed.
const fs = require('fs');
const path = require('path');

const EXEC = process.env.PRICES_URL || 'https://script.google.com/macros/s/AKfycbyVOm1Csc7UmCxPe3buHUkZkIaskguIRgT8dvTJw_aaTAX5UYY_-irjDi1X6vOD1BgJ/exec?view=prices';
const FILE = path.join(__dirname, '..', 'data', 'paket.json');

function normalize(raw) {
  if (!raw || !Array.isArray(raw.categories) || !Array.isArray(raw.packages)) throw new Error('Format respons tidak dikenal.');
  return {
    categories: raw.categories.map(c => ({ id: String(c.id), label: String(c.label) })),
    packages: raw.packages.map(p => ({
      id: String(p.id), namaPaket: String(p.namaPaket), kategori: String(p.kategori), harga: Number(p.harga) || 0,
      jumlahSesi: p.jumlahSesi === '' || p.jumlahSesi == null ? '' : Number(p.jumlahSesi),
      durasi: String(p.durasi || ''), deskripsi: String(p.deskripsi || ''),
      benefit: (Array.isArray(p.benefit) ? p.benefit : []).map(String).filter(Boolean), aktif: true
    }))
  };
}

// Pure: returns the file content to write.
function merge(previous, fresh, nowIso) {
  if (!fresh.packages.length && previous && previous.packages && previous.packages.length) {
    throw new Error('Respons tanpa paket, file lama dipertahankan (cek Apps Script / Sheet).');
  }
  const same = previous && JSON.stringify({ c: previous.categories, p: previous.packages }) === JSON.stringify({ c: fresh.categories, p: fresh.packages });
  return Object.assign({ updatedAt: same ? previous.updatedAt : nowIso }, fresh);
}

async function main() {
  const res = await fetch(EXEC, { redirect: 'follow' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const fresh = normalize(JSON.parse(await res.text()));
  const prev = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  fs.writeFileSync(FILE, JSON.stringify(merge(prev, fresh, new Date().toISOString()), null, 2) + '\n');
  console.log('Paket: ' + fresh.packages.length);
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { normalize, merge };
