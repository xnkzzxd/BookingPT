'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { build } = require('../tools/build.js');
const { normalize, merge } = require('../tools/sync-prices.js');

const INDEX = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const PAKET = {
  updatedAt: '2026-10-01T05:00:00.000Z',
  categories: [{ id: 'regular', label: 'Regular' }, { id: 'premium', label: 'Premium' }, { id: 'student', label: 'Student' }],
  packages: [
    { id: 'P1', namaPaket: 'Regular 8', kategori: 'regular', harga: 800000, jumlahSesi: 8, durasi: '1 Bulan', deskripsi: 'Program <intensif> & aman', benefit: ['1-on-1', 'Program Personal'], aktif: true },
    { id: 'P2', namaPaket: 'Flex', kategori: 'premium', harga: 1500000, jumlahSesi: '', durasi: '1 Bulan', deskripsi: '', benefit: [], aktif: true },
    { id: 'P3', namaPaket: 'Lama', kategori: 'regular', harga: 100000, jumlahSesi: 4, aktif: false }
  ]
};
const jsonLd = html => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));

test('harga page: real HTML text for every active package, grouped in category order, inactive hidden', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [] });
  const h = out['harga/index.html'];
  assert.ok(h.includes('Rp</small> 800.000') && h.includes('Rp</small> 1.500.000'));
  assert.ok(h.includes('≈ Rp 100.000 / sesi'));
  assert.ok(!h.includes('Lama') && !h.includes('Rp</small> 100.000'));
  assert.ok(h.indexOf('Regular') < h.indexOf('Premium'));
  assert.ok(!h.includes('Student</h2>'), 'empty category not shown');
  assert.ok(h.includes('Program &lt;intensif&gt; &amp; aman'), 'HTML-escaped');
  assert.match(h, /<meta name="robots" content="index, follow/);
  assert.match(h, /<link rel="canonical" href="https:\/\/xnkbooking\.my\.id\/harga\/">/);
});

test('JSON-LD: parses, prices equal the data, FAQ present, no "</script>" breakout', () => {
  const evil = JSON.parse(JSON.stringify(PAKET));
  evil.packages[0].namaPaket = '</script><b>x';
  const out = build({ index: INDEX, paket: evil, kelas: [] });
  for (const f of ['harga/index.html', 'index.html']) {
    const blocks = jsonLd(out[f]);
    const biz = blocks.find(b => b['@type'] === 'ProfessionalService');
    if (f === 'index.html') assert.ok(blocks.some(b => b['@type'] === 'FAQPage' && b.mainEntity.length === 5));
    const offers = biz.hasOfferCatalog.itemListElement.flatMap(c => c.itemListElement);
    assert.deepEqual(offers.map(o => o.price), ['800000', '1500000']);
    assert.ok(offers.every(o => o.priceCurrency === 'IDR'));
  }
  assert.ok(!/<\/script><b>/.test(out['harga/index.html']));
});

test('index.html: markers rebuilt idempotently, iframe and booking untouched, noscript has real links', () => {
  const once = build({ index: INDEX, paket: PAKET, kelas: [] })['index.html'];
  const twice = build({ index: once, paket: PAKET, kelas: [] })['index.html'];
  assert.equal(once, twice);
  assert.ok(once.includes('src="https://script.google.com/macros/s/') && once.includes('view=Landing'));
  assert.ok(once.includes('<a href="/harga/">Lihat semua harga</a>'));
  assert.ok(!once.includes('Aktifkan JavaScript untuk membuka'), 'old overlay noscript removed');
});

test('kelas: empty list = noindex page, absent from sitemap and nav; with entries = indexed', () => {
  const none = build({ index: INDEX, paket: PAKET, kelas: [] });
  assert.match(none['kelas/index.html'], /noindex/);
  assert.ok(!none['sitemap.xml'].includes('/kelas/'));
  assert.ok(!none['harga/index.html'].includes('href="/kelas/"'));
  const some = build({ index: INDEX, paket: PAKET, kelas: [{ id: 'k1', nama: 'Kelas Pagi', jadwal: 'Senin 06.00', harga: 100000, aktif: true }, { nama: 'Mati', aktif: false }] });
  assert.match(some['kelas/index.html'], /index, follow/);
  assert.ok(some['kelas/index.html'].includes('Kelas Pagi') && !some['kelas/index.html'].includes('Mati'));
  assert.ok(some['sitemap.xml'].includes('/kelas/') && some['harga/index.html'].includes('href="/kelas/"'));
});

test('no packages yet: /harga is noindex and out of the sitemap, nothing invented', () => {
  const out = build({ index: INDEX, paket: { updatedAt: null, categories: PAKET.categories, packages: [] }, kelas: [] });
  assert.match(out['harga/index.html'], /noindex/);
  assert.ok(!out['sitemap.xml'].includes('/harga/'));
  assert.ok(!jsonLd(out['index.html']).some(b => b.hasOfferCatalog));
});

test('sitemap and robots are stable and point at each other; llms.txt lists prices', () => {
  const a = build({ index: INDEX, paket: PAKET, kelas: [] }), b = build({ index: INDEX, paket: PAKET, kelas: [] });
  assert.equal(a['sitemap.xml'], b['sitemap.xml']);
  assert.match(a['sitemap.xml'], /<lastmod>2026-10-01<\/lastmod>/);
  assert.match(a['robots.txt'], /Allow: \/\n[\s\S]*Sitemap: https:\/\/xnkbooking\.my\.id\/sitemap\.xml/);
  assert.ok(a['llms.txt'].includes('Regular 8: Rp 800.000, 8 sesi') && a['llms.txt'].includes('Flex: Rp 1.500.000, unlimited'));
});

test('sync: keeps public fields only, keeps updatedAt when nothing changed, refuses an empty response over real data', () => {
  const fresh = normalize({ categories: PAKET.categories, packages: [{ id: 'P1', namaPaket: 'A', kategori: 'regular', harga: '800000', jumlahSesi: 8, phone: '0812', secret: 'x', benefit: ['x', ''] }] });
  assert.deepEqual(Object.keys(fresh.packages[0]).sort(), ['aktif', 'benefit', 'deskripsi', 'durasi', 'harga', 'id', 'jumlahSesi', 'kategori', 'namaPaket']);
  const first = merge({ updatedAt: null, categories: [], packages: [] }, fresh, '2026-10-01T00:00:00Z');
  assert.equal(first.updatedAt, '2026-10-01T00:00:00Z');
  assert.equal(merge(first, fresh, '2026-12-01T00:00:00Z').updatedAt, '2026-10-01T00:00:00Z');
  assert.throws(() => merge(first, { categories: [], packages: [] }, 'x'), /dipertahankan/);
});

test('theme: landing fonts, fixed nav with burger menu, black footer, one featured card per multi-package category', () => {
  const h = build({ index: INDEX, paket: PAKET, kelas: [] })['harga/index.html'];
  assert.ok(h.includes('family=Anton') && h.includes('family=Inter'));
  assert.ok(h.includes('class="nav" id="nav"') && h.includes('id="burger"') && h.includes('id="m-menu"'));
  assert.ok(h.includes('class="footer"') && h.includes('footer-giant'));
  assert.equal((h.match(/class="price featured"/g) || []).length, 0, 'one package per category: nothing featured');
  const three = JSON.parse(JSON.stringify(PAKET));
  three.packages.push({ id: 'P4', namaPaket: 'Regular 12', kategori: 'regular', harga: 1200000, jumlahSesi: 12, aktif: true }, { id: 'P5', namaPaket: 'Regular 4', kategori: 'regular', harga: 400000, jumlahSesi: 4, aktif: true });
  const h3 = build({ index: INDEX, paket: three, kelas: [] })['harga/index.html'];
  assert.equal((h3.match(/class="price featured"/g) || []).length, 1);
  assert.ok(/<article class="price featured" id="P4">/.test(h3), 'the middle card (of 3) is featured');
  for (const m of h3.matchAll(/href="#(kategori-[a-z]+)"/g)) assert.ok(h3.includes('id="' + m[1] + '"'), m[1]);
});
