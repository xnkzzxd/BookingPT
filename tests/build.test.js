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
    if (f === 'index.html') assert.ok(blocks.some(b => b['@type'] === 'FAQPage' && b.mainEntity.length === 7));
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

// ── keyword pages ────────────────────────────────────────────────────────────
const KEYWORD_PAGES = ['personal-trainer-purwokerto', 'personal-trainer-banyumas', 'personal-trainer-banjarnegara', 'personal-trainer-online', 'personal-trainer-ke-rumah',
  'program/fat-loss', 'program/muscle-building', 'program/strength-conditioning', 'program/sports-performance'];
const LOKASI_FULL = { purwokerto: { nama: 'Studio X', alamat: 'Jl. Contoh No. 1', kodePos: '53111', maps: 'https://maps.app.goo.gl/x', lat: -7.42, lng: 109.24 }, banjarnegara: {} };
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

test('keyword pages: unique title/description/canonical, exactly one h1 with the keyword, indexable', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  const titles = new Set(), descs = new Set();
  for (const slug of KEYWORD_PAGES) {
    const h = out[slug + '/index.html'];
    assert.ok(h, slug);
    assert.equal((h.match(/<h1[ >]/g) || []).length, 1, slug + ' h1 count');
    assert.match(h, new RegExp('<link rel="canonical" href="https://xnkbooking\\.my\\.id/' + slug + '/">'));
    assert.match(h, /content="index, follow/);
    titles.add(h.match(/<title>(.*?)<\/title>/)[1]); descs.add(h.match(/<meta name="description" content="(.*?)">/)[1]);
    assert.ok(decode(h.match(/<title>(.*?)<\/title>/)[1]).length <= 70, 'title not too long');
    assert.ok(decode(h.match(/<meta name="description" content="(.*?)">/)[1]).length <= 160, 'description fits a snippet');
  }
  assert.equal(titles.size, KEYWORD_PAGES.length); assert.equal(descs.size, KEYWORD_PAGES.length);
  assert.match(decode(out['personal-trainer-purwokerto/index.html']), /<h1[^>]*>Personal Trainer Purwokerto<\/h1>/);
  assert.match(decode(out['personal-trainer-online/index.html']), /Online Purwokerto &amp; Banjarnegara|Online Purwokerto & Banjarnegara/);
});

test('keyword pages: in the sitemap, linked from home noscript, nav and each other; every internal link resolves', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  for (const slug of KEYWORD_PAGES) {
    assert.ok(out['sitemap.xml'].includes('/' + slug + '/'), slug + ' in sitemap');
    assert.ok(out['index.html'].includes('href="/' + slug + '/"'), slug + ' linked from home');
    assert.ok(out['llms.txt'].includes('/' + slug + '/'));
  }
  const exists = p => p === '/' || out[p.replace(/^\//, '') + 'index.html'] !== undefined || ['/harga/', '/kelas/'].includes(p);
  for (const [f, h] of Object.entries(out)) {
    if (!f.endsWith('.html')) continue;
    for (const m of h.matchAll(/href="(\/[^"#]*)(#[^"]*)?"/g)) if (/\/$/.test(m[1])) assert.ok(exists(m[1]), f + ' links to missing ' + m[1]);
  }
});

test('keyword pages: FAQ text equals FAQPage JSON-LD, Service JSON-LD has the lowest price from the data', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  for (const slug of KEYWORD_PAGES) {
    const h = out[slug + '/index.html'], blocks = jsonLd(h);
    const faq = blocks.find(b => b['@type'] === 'FAQPage');
    assert.ok(faq && faq.mainEntity.length >= 5);
    for (const q of faq.mainEntity) assert.ok(decode(h).includes(q.acceptedAnswer.text), 'answer visible on page: ' + q.name);
    const svc = blocks.find(b => b['@type'] === 'Service');
    assert.equal(svc.offers.lowPrice, '800000'); assert.equal(svc.offers.highPrice, '1500000'); assert.equal(svc.offers.offerCount, '2');
    assert.ok(blocks.some(b => b['@type'] === 'BreadcrumbList'));
  }
  assert.ok(out['personal-trainer-purwokerto/index.html'].includes('mulai dari Rp 800.000'));
});

test('local business data: no address given = service area only (nothing invented); address given = Place with geo, shown on the city page', () => {
  const none = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  assert.ok(!jsonLd(none['index.html']).some(b => b.location));
  assert.ok(!none['personal-trainer-purwokerto/index.html'].includes('Lokasi latihan'));
  const full = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: LOKASI_FULL });
  const biz = jsonLd(full['index.html']).find(b => b['@type'] === 'ProfessionalService');
  assert.equal(biz.location.length, 1);
  assert.equal(biz.location[0].address.streetAddress, 'Jl. Contoh No. 1');
  assert.equal(biz.location[0].address.addressLocality, 'Purwokerto');
  assert.equal(biz.location[0].geo.latitude, -7.42);
  assert.ok(biz.sameAs.includes('https://www.instagram.com/jiz.dan/'));
  const h = full['personal-trainer-purwokerto/index.html'];
  assert.ok(h.includes('Lokasi latihan') && h.includes('Studio X') && h.includes('Jl. Contoh No. 1'));
  assert.ok(!full['personal-trainer-banjarnegara/index.html'].includes('Lokasi latihan'));
});

// ── coach credentials, visible home section ──────────────────────────────────
test('coach: bio and both source links on city, online and home pages; Person JSON-LD matches the sources', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  for (const f of ['personal-trainer-purwokerto/index.html', 'personal-trainer-banjarnegara/index.html', 'personal-trainer-online/index.html', 'index.html']) {
    const h = out[f];
    assert.ok(h.includes('Universitas Jenderal Soedirman'), f);
    assert.ok(h.includes('href="https://old.unsoed.ac.id/id/delegasi-unsoed-raih-prestasi-senam-virtual-2023"'), f);
    assert.ok(h.includes('href="https://jateng.antaranews.co/berita/487353/mahaiswa-unsoed-purwokerto-raih-prestasi-senam-virtual-2023"'), f);
    assert.ok(!/alumnus|alumni(?! )/i.test(decode(h.replace(/<script[\s\S]*?<\/script>/g, ''))), 'no unconfirmed alumnus claim in visible text: ' + f);
  }
  const person = jsonLd(out['index.html']).find(b => b['@type'] === 'ProfessionalService').founder;
  assert.equal(person.legalName, 'Yandura Jizdan Hasya Husnayain');
  assert.equal(person.alumniOf.name, 'Universitas Jenderal Soedirman');
  assert.match(person.award, /Juara 2 Senam Virtual UMPP 2023/);
  assert.equal(person.subjectOf.length, 2);
  assert.ok(person.sameAs.includes('https://www.instagram.com/jiz.dan/'));
});

test('home: visible keyword section under the iframe, real text, links resolve, nothing hidden', () => {
  const h = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} })['index.html'];
  const main = h.slice(h.indexOf('<!--SEO-MAIN:START-->'), h.indexOf('<!--SEO-MAIN:END-->'));
  assert.ok(main.includes('<h1 class="h2">Personal Trainer Purwokerto &amp; Banjarnegara</h1>'));
  assert.ok(main.includes('mulai dari Rp 800.000') && main.includes('href="#info"') && main.includes('id="info"'));
  for (const slug of KEYWORD_PAGES) assert.ok(main.includes('href="/' + slug + '/"'), slug);
  assert.equal((h.match(/<h1[ >]/g) || []).length, 1, 'one h1 on the home page');
  assert.ok(!/display:\s*none|visibility:\s*hidden|text-indent:\s*-|left:\s*-\d{3,}|font-size:\s*0|opacity:\s*0[;"]/i.test(main), 'no hiding techniques in the visible section');
  assert.ok(h.indexOf('<iframe') < h.indexOf('<!--SEO-MAIN:START-->'));
});

// ── trust pages ──────────────────────────────────────────────────────────────
test('trust pages: /tentang/ and /privasi/ exist, indexable, one h1, linked from footer, sitemap and home', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: LOKASI_FULL });
  for (const slug of ['tentang', 'privasi']) {
    const h = out[slug + '/index.html'];
    assert.ok(h, slug);
    assert.equal((h.match(/<h1[ >]/g) || []).length, 1, slug + ' h1');
    assert.match(h, new RegExp('<link rel="canonical" href="https://xnkbooking\\.my\\.id/' + slug + '/">'));
    assert.match(h, /index, follow/);
    assert.ok(out['sitemap.xml'].includes('/' + slug + '/'));
    assert.ok(out['llms.txt'].includes('/' + slug + '/'));
    for (const page of ['harga/index.html', 'personal-trainer-purwokerto/index.html']) assert.ok(out[page].includes('href="/' + slug + '/"'), page + ' footer links ' + slug);
  }
  assert.ok(out['index.html'].includes('class="trust-strip"') && out['index.html'].includes('href="/tentang/"') && out['index.html'].includes('href="/privasi/"'));
});

test('trust pages: say what we never ask, payment text equals the FAQ, address comes from data, nothing hidden', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: LOKASI_FULL });
  const t = decode(out['tentang/index.html']);
  assert.ok(t.includes('Kami tidak pernah meminta kata sandi, PIN, atau kode OTP kamu.'));
  assert.ok(t.includes('Pembayaran dilakukan di awal per paket'));
  assert.ok(t.includes('Studio X') && t.includes('Jl. Contoh No. 1'));
  assert.ok(t.includes('Banjarnegara:') && t.includes('area layanan'));
  const none = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  assert.ok(!decode(none['tentang/index.html']).includes('Jl. Contoh'), 'no address invented');
  const p = decode(out['privasi/index.html']);
  assert.ok(p.includes('Foto progres bersifat pribadi') && p.includes('tidak dijual'));
  for (const h of [out['tentang/index.html'], out['privasi/index.html'], out['index.html']]) assert.ok(!/display:\s*none|visibility:\s*hidden|text-indent:\s*-|font-size:\s*0/i.test(h.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '')), 'no hiding techniques');
});

test('security.txt is valid (RFC 9116 fields, real line breaks) and the business JSON-LD has a ContactPoint', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  const lines = out['.well-known/security.txt'].split('\n');
  assert.ok(lines[0].startsWith('Contact: https://wa.me/'));
  assert.ok(lines.some(l => /^Expires: \d{4}-\d{2}-\d{2}T/.test(l)));
  assert.ok(!out['.well-known/security.txt'].includes('\\n'));
  const biz = jsonLd(out['index.html']).find(b => b['@type'] === 'ProfessionalService');
  assert.equal(biz.contactPoint.telephone, '+6288221254305');
});


// ── "is it official and safe?" answer ────────────────────────────────────────
test('trust FAQ: answered on /tentang/ and the home page, same text in FAQPage JSON-LD, facts only', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  for (const f of ['tentang/index.html', 'index.html']) {
    const h = out[f];
    const faq = jsonLd(h).find(b => b['@type'] === 'FAQPage');
    const q = faq.mainEntity.find(x => x.name === 'Apakah xnkbooking.my.id resmi dan aman?');
    assert.ok(q, f);
    assert.ok(decode(h).includes(q.acceptedAnswer.text), f + ': answer visible on page');
    assert.ok(q.acceptedAnswer.text.includes('Yandura Jizdan Hasya Husnayain') && q.acceptedAnswer.text.includes('tidak memproses pembayaran'));
    assert.ok(!/threads|penipu|scam/i.test(q.acceptedAnswer.text), 'no mention of third-party threads or accusations');
  }
  assert.ok(out['llms.txt'].includes('## Verifikasi') && out['llms.txt'].includes('old.unsoed.ac.id'));
  assert.ok(!/display:\s*none|visibility:\s*hidden/i.test(out['tentang/index.html'].replace(/<style[\s\S]*?<\/style>/g, '')), 'nothing hidden');
});


// ── SEO/GEO upgrade: Banyumas, home visits, goal pages, AI crawlers ─────────
test('synonyms: every city page and the home section name PT gym and coach gym in real text', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  for (const f of ['personal-trainer-purwokerto/index.html', 'personal-trainer-banyumas/index.html', 'personal-trainer-banjarnegara/index.html', 'personal-trainer-ke-rumah/index.html', 'index.html']) {
    const text = decode(out[f].replace(/<script[\s\S]*?<\/script>/g, ''));
    assert.ok(/PT gym/.test(text) && /coach gym/.test(text), f);
  }
  assert.match(out['personal-trainer-banyumas/index.html'], /<title>PT Gym &amp; Personal Trainer Banyumas/);
  for (const s of ['Sokaraja', 'Baturraden']) assert.ok(out['personal-trainer-banyumas/index.html'].includes(s));
});

test('Banyumas shares the Purwokerto gym (one Place, never duplicated); no address = nothing invented, no placeholders left', () => {
  const full = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: LOKASI_FULL });
  const b = full['personal-trainer-banyumas/index.html'];
  assert.ok(b.includes('Lokasi latihan') && b.includes('Studio X') && b.includes('Jl. Contoh No. 1'));
  for (const f of ['index.html', 'personal-trainer-banyumas/index.html']) {
    const biz = jsonLd(full[f]).find(x => x['@type'] === 'ProfessionalService');
    assert.equal(biz.location.length, 1, f);
  }
  const none = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  for (const [f, h] of Object.entries(none)) {
    assert.ok(!/\{gym\}|\{alamatGym\}/.test(h), f + ' has an unfilled placeholder');
    assert.ok(!/Wellness Gym|Jatisari|Studio X/.test(h), f + ' invents a place');
  }
  assert.ok(decode(none['personal-trainer-banyumas/index.html']).includes('alamat dikonfirmasi lewat WhatsApp'));
});

test('business JSON-LD: areas served include Banyumas (as a regency), Sokaraja, Baturraden; home visits and goal pages are offers', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  const biz = jsonLd(out['index.html']).find(b => b['@type'] === 'ProfessionalService');
  const names = biz.areaServed.map(a => a.name);
  for (const n of ['Purwokerto', 'Sokaraja', 'Baturraden', 'Banjarnegara']) assert.ok(names.includes(n), n);
  assert.ok(biz.areaServed.some(a => a['@type'] === 'AdministrativeArea' && a.name === 'Kabupaten Banyumas'));
  const urls = biz.makesOffer.map(o => o.itemOffered.url);
  assert.ok(urls.includes('https://xnkbooking.my.id/personal-trainer-ke-rumah/'));
  assert.ok(urls.includes('https://xnkbooking.my.id/program/fat-loss/'));
});

test('GEO: answer-first summary box, WebPage dateModified from the data (stable), AI crawlers named in robots', () => {
  const a = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} }), b = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  for (const slug of KEYWORD_PAGES) {
    const h = a[slug + '/index.html'];
    assert.ok(h.includes('class="facts"') && h.includes('<dt>Harga</dt>'), slug + ' summary');
    const wp = jsonLd(h).find(x => x['@type'] === 'WebPage');
    assert.equal(wp.dateModified, '2026-10-01', slug);
    assert.equal(h, b[slug + '/index.html'], slug + ' rebuild is identical');
  }
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) assert.match(a['robots.txt'], new RegExp('User-agent: ' + bot + '\\nAllow: /'));
  assert.ok(!/Disallow: \/\s/.test(a['robots.txt']));
});

test('llms.txt and llms-full.txt: every keyword page, plain text only, noindex pages left out', () => {
  const out = build({ index: INDEX, paket: PAKET, kelas: [], lokasi: {} });
  const full = out['llms-full.txt'];
  for (const slug of KEYWORD_PAGES) {
    assert.ok(full.includes('URL: https://xnkbooking.my.id/' + slug + '/'), slug);
    assert.ok(out['llms.txt'].includes('/' + slug + '/'), slug);
  }
  assert.ok(!/<\/?(a|p|div|span|h[1-6]|li|ul|ol|dl|dt|dd|section|svg|details|summary|main)\b/i.test(full), 'no HTML tags');
  assert.ok(!full.includes('/kelas/'), 'noindex kelas page left out');
  assert.ok(full.includes('# Personal Trainer Banyumas'));
  assert.ok(out['llms.txt'].includes('llms-full.txt') && out['llms.txt'].includes('## Tanya jawab singkat'));
});
