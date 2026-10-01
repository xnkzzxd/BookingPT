#!/usr/bin/env node
'use strict';
// Builds the static, crawlable parts of xnkbooking.my.id from data/*.json:
//   harga/index.html, kelas/index.html, sitemap.xml, robots.txt, llms.txt,
//   and the JSON-LD + <noscript> summary inside index.html (between the SEO markers).
// No dependencies. Run: node tools/build.js

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://xnkbooking.my.id';
const BOOK_URL = 'https://book.xnkbooking.my.id/';
const WA_NUMBER = '6288221254305';
const NAME = 'XNK Personal Training';
const COACH = 'Coach Jizdan';
const AREAS = ['Banjarnegara', 'Purwokerto'];

// Same wording as the FAQ on the landing page (Landing.html in the XNK repo).
const FAQ = [
  ['Apakah saya perlu punya pengalaman fitness?', 'Tidak sama sekali! Program kami dirancang untuk semua level, dari pemula total hingga atlet. Coach akan menyesuaikan intensitas dan kompleksitas latihan sesuai kemampuanmu.'],
  ['Bagaimana sistem pembayarannya?', 'Pembayaran dilakukan di awal per paket (bukan per sesi). Kami menerima transfer bank (BRI), e-wallet (DANA) & cash. Setelah pembayaran dikonfirmasi, sesi kamu aktif dan bisa langsung booking jadwal.'],
  ['Apakah ada session expire?', 'Ya, setiap paket memiliki masa berlaku 1 bulan. Tapi tenang, kami selalu ingatkan via WhatsApp sebelum masa berlaku habis!'],
  ['Bisa ganti jadwal di hari yang sama?', 'Bisa! Kami mengerti ada keadaan darurat. Cukup hubungi coach via WhatsApp minimal 2 jam sebelum sesi untuk reschedule tanpa penalti.'],
  ['Apakah ada sesi trial?', 'Ada! Kami menyediakan 1 sesi trial gratis untuk kamu yang ingin merasakan latihan bersama coach sebelum memutuskan. Klik "Mulai Sekarang" untuk menjadwalkan trial.']
];
const PROGRAMS = ['Fat Loss', 'Muscle Building', 'Strength & Conditioning', 'Sports Performance'];

const SEO_HEAD = ['<!--SEO:START-->', '<!--SEO:END-->'];
const SEO_BODY = ['<!--SEO-BODY:START-->', '<!--SEO-BODY:END-->'];

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Keeps JSON-LD safe inside <script>: "</script>" and "<!--" can't appear.
function ld(obj) {
  return '<script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';
}
function rupiah(n) {
  return 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID');
}
function waLink(text) {
  return 'https://wa.me/' + WA_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');
}

// ── data ─────────────────────────────────────────────────────────────────────

function cleanPaket(raw) {
  const cats = Array.isArray(raw && raw.categories) ? raw.categories : [];
  const pkgs = (Array.isArray(raw && raw.packages) ? raw.packages : []).filter(p => p && p.aktif !== false && p.namaPaket && Number(p.harga) > 0);
  const groups = cats.map(c => ({ id: c.id, label: c.label, packages: pkgs.filter(p => p.kategori === c.id) })).filter(g => g.packages.length);
  return { updatedAt: (raw && raw.updatedAt) || null, groups, packages: groups.reduce((a, g) => a.concat(g.packages), []) };
}
function cleanKelas(raw) {
  return (Array.isArray(raw) ? raw : []).filter(k => k && k.aktif !== false && k.nama);
}

// ── JSON-LD ──────────────────────────────────────────────────────────────────

function offerOf(p) {
  const o = {
    '@type': 'Offer', name: p.namaPaket, price: String(Math.round(Number(p.harga))), priceCurrency: 'IDR',
    url: BASE + '/harga/#' + p.id, availability: 'https://schema.org/InStock'
  };
  if (p.deskripsi) o.description = p.deskripsi;
  return o;
}

function businessLd(paket, kelas) {
  const biz = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': BASE + '/#business',
    name: NAME, alternateName: COACH + ' · Personal Trainer', url: BASE + '/',
    image: BASE + '/img/og.jpg', logo: BASE + '/icon-192.png', telephone: '+' + WA_NUMBER,
    description: 'Personal trainer berbasis sport science di Banjarnegara & Purwokerto: fat loss, muscle building, strength & conditioning, sports performance. 1 sesi trial gratis.',
    areaServed: AREAS.map(a => ({ '@type': 'City', name: a })), inLanguage: 'id', priceRange: 'Rp',
    founder: { '@type': 'Person', '@id': BASE + '/#coach', name: COACH, jobTitle: 'Personal Trainer', knowsAbout: PROGRAMS },
    makesOffer: PROGRAMS.map(n => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } }))
  };
  if (paket.packages.length) {
    biz.hasOfferCatalog = {
      '@type': 'OfferCatalog', name: 'Paket Personal Training', url: BASE + '/harga/',
      itemListElement: paket.groups.map(g => ({ '@type': 'OfferCatalog', name: g.label, itemListElement: g.packages.map(offerOf) }))
    };
  }
  if (kelas.length) {
    biz.department = kelas.map(k => ({ '@type': 'Service', name: k.nama, description: k.deskripsi || undefined }));
  }
  return biz;
}
function siteLd() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': BASE + '/#website', url: BASE + '/', name: NAME, inLanguage: 'id', publisher: { '@id': BASE + '/#business' } };
}
function faqLd() {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
}
function breadcrumbLd(label, url) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Beranda', item: BASE + '/' }, { '@type': 'ListItem', position: 2, name: label, item: url }]
  };
}

// ── pages ────────────────────────────────────────────────────────────────────

const LOGO_MARK = '<span class="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11l5-5 5 5M7 17l5-5 5 5"/></svg></span>';
const ARROW = '<svg class="icon arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function navItems(o) {
  const items = [['/', 'Beranda', ''], ['/harga/', 'Harga', 'harga']];
  if (o.showKelas) items.push(['/kelas/', 'Kelas', 'kelas']);
  items.push(['/harga/#faq', 'FAQ', '']);
  return items;
}

// Same look as the landing (LandingStyle.html in the XNK repo): fixed nav, full-screen black menu on phones, black footer.
function page(o) {
  const items = navItems(o);
  const links = items.map(i => '<a class="nav-link"' + (o.current && o.current === i[2] ? ' aria-current="page"' : '') + ' href="' + i[0] + '">' + i[1] + '</a>').join('');
  const mlinks = items.map((i, n) => '<a href="' + i[0] + '"><small>0' + (n + 1) + '</small>' + i[1] + '</a>').join('');
  const wa = waLink('Halo Coach Jizdan, saya mau tanya program personal training.');
  return '<!DOCTYPE html>\n<html lang="id">\n<head>\n<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    '<title>' + esc(o.title) + '</title>\n' +
    '<meta name="description" content="' + esc(o.description) + '">\n' +
    '<link rel="canonical" href="' + o.url + '">\n' +
    '<meta name="robots" content="' + (o.index ? 'index, follow, max-image-preview:large' : 'noindex, follow') + '">\n' +
    '<meta name="theme-color" content="#ECECEC">\n' +
    '<meta property="og:type" content="website">\n<meta property="og:site_name" content="' + NAME + '">\n<meta property="og:locale" content="id_ID">\n' +
    '<meta property="og:url" content="' + o.url + '">\n<meta property="og:title" content="' + esc(o.title) + '">\n' +
    '<meta property="og:description" content="' + esc(o.description) + '">\n<meta property="og:image" content="' + BASE + '/img/og.jpg">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n' +
    '<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">\n' +
    '<link rel="stylesheet" href="/site.css">\n' +
    o.ld.map(ld).join('\n') + '\n</head>\n<body>\n' +
    '<header class="nav" id="nav"><a class="logo" href="/" aria-label="XNK, beranda">' + LOGO_MARK + '<span class="logo-word">XNK</span></a>' +
    '<nav class="nav-links" aria-label="Menu">' + links + '</nav>' +
    '<a class="btn btn-dark btn-sm nav-cta" href="' + BOOK_URL + '">Sudah member?' + ARROW + '</a>' +
    '<button type="button" class="burger" id="burger" aria-label="Buka menu" aria-expanded="false" aria-controls="m-menu"><span></span><span></span></button></header>\n' +
    '<div class="m-menu" id="m-menu" aria-hidden="true"><nav class="m-menu-links" aria-label="Menu">' + mlinks + '</nav>' +
    '<div class="m-menu-foot"><a class="btn btn-light btn-block" href="' + BOOK_URL + '">Mulai Sekarang</a><a class="m-menu-wa" href="' + wa + '" rel="noopener">Chat WhatsApp →</a></div></div>\n' +
    '<main>\n' + o.body + '\n</main>\n' +
    '<footer class="footer"><div class="wrap footer-grid">' +
    '<div class="footer-brand"><span class="logo"><span class="logo-mark logo-mark-light"><svg viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11l5-5 5 5M7 17l5-5 5 5"/></svg></span><span class="logo-word">XNK</span></span>' +
    '<p>Personal training berbasis sport science bersama ' + COACH + ' di ' + AREAS.join(' &amp; ') + '.</p></div>' +
    '<div class="footer-col"><p class="footer-h">Menu</p>' + items.map(i => '<a href="' + i[0] + '">' + i[1] + '</a>').join('') + '</div>' +
    '<div class="footer-col"><p class="footer-h">Kontak</p><a href="' + BOOK_URL + '">Booking &amp; login klien</a><a href="' + wa + '" rel="noopener">WhatsApp</a></div></div>' +
    '<div class="footer-giant" aria-hidden="true">XNK</div><p class="wrap footer-copy">&copy; 2026 XNK Personal Training. All rights reserved.</p></footer>\n' +
    '<script>(function(){var b=document.getElementById("burger"),n=document.getElementById("nav"),m=document.getElementById("m-menu");' +
    'function t(o){document.body.classList.toggle("menu-open",o);b.setAttribute("aria-expanded",o);m.setAttribute("aria-hidden",!o);}' +
    'b.addEventListener("click",function(){t(!document.body.classList.contains("menu-open"));});' +
    'm.addEventListener("click",function(e){if(e.target.closest("a"))t(false);});' +
    'function s(){n.classList.toggle("scrolled",window.pageYOffset>20);}window.addEventListener("scroll",s,{passive:true});s();' +
    'var seg=document.querySelector(".seg");if(seg)seg.addEventListener("click",function(e){var a=e.target.closest(".toggle-btn");if(!a)return;[].forEach.call(seg.children,function(x){x.classList.toggle("active",x===a);});});' +
    'document.addEventListener("pointermove",function(e){var c=e.target.closest&&e.target.closest(".price");if(!c)return;var r=c.getBoundingClientRect();c.style.setProperty("--mx",(e.clientX-r.left)+"px");c.style.setProperty("--my",(e.clientY-r.top)+"px");});' +
    '})();</script>\n' +
    '</body>\n</html>\n';
}

function priceCard(p, featured) {
  const per = p.jumlahSesi && Number(p.harga) ? '<p class="price-per">≈ ' + rupiah(Number(p.harga) / p.jumlahSesi) + ' / sesi</p>' : '';
  const ben = (p.benefit || []).filter(Boolean).slice(0, 4).map(b => '<li>' + CHECK + '<span>' + esc(b) + '</span></li>').join('');
  const meta = (p.jumlahSesi ? p.jumlahSesi + ' sesi' : 'Unlimited') + (p.durasi ? ' · ' + esc(p.durasi) : '');
  return '<article class="price' + (featured ? ' featured' : '') + '" id="' + esc(p.id) + '">' + (featured ? '<span class="price-badge">Rekomendasi</span>' : '') +
    '<h3 class="price-name">' + esc(p.namaPaket) + '</h3><p class="price-meta">' + meta + '</p>' +
    '<p class="price-amt"><small>Rp</small> ' + esc(Math.round(Number(p.harga) || 0).toLocaleString('id-ID')) + '</p>' + per +
    (p.deskripsi ? '<p class="price-desc">' + esc(p.deskripsi) + '</p>' : '') + (ben ? '<ul class="price-list">' + ben + '</ul>' : '<div class="price-gap"></div>') +
    '<a class="btn ' + (featured ? 'btn-light' : 'btn-dark') + '" href="' + waLink('Halo Coach Jizdan, saya tertarik paket ' + p.namaPaket + '.') + '" rel="noopener">Tanya paket ini' + ARROW + '</a></article>';
}

function buildHarga(paket, kelas) {
  const has = paket.packages.length > 0;
  const low = has ? Math.min.apply(null, paket.packages.map(p => Number(p.harga))) : 0;
  const cats = has ? paket.groups.map(g => {
    const mid = g.packages.length > 1 ? Math.floor((g.packages.length - 1) / 2) : -1;
    return '<div class="cat" id="kategori-' + esc(g.id) + '"><h2 class="cat-h">' + esc(g.label) + '</h2><div class="price-track">' +
      g.packages.map((p, i) => priceCard(p, i === mid)).join('') + '</div></div>';
  }).join('') : '<p class="lead">Daftar harga sedang diperbarui. Hubungi kami lewat WhatsApp untuk info paket terbaru.</p>';
  const seg = has && paket.groups.length > 1 ? '<div class="seg" role="navigation" aria-label="Kategori paket">' +
    paket.groups.map((g, i) => '<a class="toggle-btn' + (i === 0 ? ' active' : '') + '" href="#kategori-' + esc(g.id) + '">' + esc(g.label) + '</a>').join('') + '</div>' : '';
  const body =
    '<section class="sec sec-hero"><div class="wrap"><p class="eyebrow">Harga &amp; Paket</p>' +
    '<h1 class="h2">Investasi untuk dirimu</h1>' +
    '<p class="lead">Harga personal training di Banjarnegara &amp; Purwokerto. Semua paket termasuk sesi 1-on-1 dengan ' + COACH + ', program personal berbasis sport science, dan 1 sesi trial gratis untuk calon klien baru.' + (has ? ' Mulai dari ' + rupiah(low) + '.' : '') + '</p>' +
    '<div class="hero-actions"><a class="btn btn-dark" href="' + BOOK_URL + '">Mulai Sekarang' + ARROW + '</a><a class="btn btn-line" href="' + waLink('Halo Coach Jizdan, saya mau konsultasi paket personal training.') + '" rel="noopener">Konsultasi gratis</a></div></div></section>' +
    '<section class="sec sec-paket" id="paket"><div class="wrap"><div class="sec-head-row"><div><p class="eyebrow">Pilih Paket</p><h2 class="h2">Paket &amp; harga</h2></div>' + seg + '</div>' + cats +
    (paket.updatedAt ? '<p class="note">Harga diperbarui ' + esc(String(paket.updatedAt).slice(0, 10)) + '.</p>' : '') + '</div></section>' +
    '<section class="sec sec-faq" id="faq"><div class="wrap faq-grid"><div><p class="eyebrow">Pertanyaan Umum</p><h2 class="h2">FAQ</h2><p class="lead">Belum terjawab? Tanya langsung ke coach lewat WhatsApp.</p></div>' +
    '<div class="faq-list">' + FAQ.map(([q, a]) => '<details class="faq-item"><summary class="faq-q">' + esc(q) + '<span class="faq-icon" aria-hidden="true"></span></summary><p class="faq-a">' + esc(a) + '</p></details>').join('') + '</div></div></section>';
  return page({
    title: 'Harga Personal Training Banjarnegara & Purwokerto · ' + NAME,
    description: 'Daftar harga paket personal training ' + COACH + ' di Banjarnegara & Purwokerto' + (has ? ', mulai ' + rupiah(low) : '') + '. Termasuk 1 sesi trial gratis.',
    url: BASE + '/harga/', index: has, current: 'harga', showKelas: kelas.length > 0, body,
    ld: [businessLd(paket, kelas), breadcrumbLd('Harga', BASE + '/harga/'), faqLd()]
  });
}

function kelasCard(k) {
  const rows = [['Jadwal', k.jadwal], ['Durasi', k.durasi], ['Level', k.level], ['Lokasi', k.lokasi], ['Kapasitas', k.kapasitas ? k.kapasitas + ' peserta' : '']]
    .filter(r => r[1]).map(r => '<li>' + CHECK + '<span><b>' + r[0] + ':</b> ' + esc(r[1]) + '</span></li>').join('');
  return '<article class="price" id="' + esc(k.id || '') + '"><h3 class="price-name">' + esc(k.nama) + '</h3>' +
    (Number(k.harga) > 0 ? '<p class="price-amt"><small>Rp</small> ' + esc(Math.round(Number(k.harga)).toLocaleString('id-ID')) + '</p>' : '') +
    (k.deskripsi ? '<p class="price-desc">' + esc(k.deskripsi) + '</p>' : '') + (rows ? '<ul class="price-list">' + rows + '</ul>' : '<div class="price-gap"></div>') +
    '<a class="btn btn-dark" href="' + waLink('Halo Coach Jizdan, saya tertarik kelas ' + k.nama + '.') + '" rel="noopener">Tanya kelas ini' + ARROW + '</a></article>';
}

function buildKelas(paket, kelas) {
  const has = kelas.length > 0;
  const body =
    '<section class="sec sec-hero"><div class="wrap"><p class="eyebrow">Kelas</p><h1 class="h2">Kelas latihan</h1>' +
    '<p class="lead">' + (has ? 'Jadwal dan harga kelas ' + COACH + ' yang sedang dibuka.' : 'Kelas baru akan segera dibuka. Hubungi kami lewat WhatsApp untuk kabar terbaru.') + '</p></div></section>' +
    (has ? '<section class="sec sec-paket"><div class="wrap"><div class="price-track">' + kelas.map(kelasCard).join('') + '</div></div></section>' : '');
  const ldList = has ? [{
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Kelas ' + NAME,
    itemListElement: kelas.map((k, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: Object.assign({ '@type': 'Service', name: k.nama, provider: { '@id': BASE + '/#business' }, areaServed: AREAS.map(a => ({ '@type': 'City', name: a })) },
        k.deskripsi ? { description: k.deskripsi } : {},
        Number(k.harga) > 0 ? { offers: { '@type': 'Offer', price: String(Math.round(Number(k.harga))), priceCurrency: 'IDR' } } : {})
    }))
  }] : [];
  return page({
    title: 'Kelas Latihan ' + COACH + ' · ' + NAME,
    description: 'Jadwal dan harga kelas latihan ' + COACH + ' di Banjarnegara & Purwokerto.',
    url: BASE + '/kelas/', index: has, current: 'kelas', showKelas: has, body,
    ld: [breadcrumbLd('Kelas', BASE + '/kelas/')].concat(ldList)
  });
}

// ── index.html (wrapper) ─────────────────────────────────────────────────────

function between(html, markers, inner) {
  const a = html.indexOf(markers[0]), b = html.indexOf(markers[1]);
  if (a < 0 || b < a) throw new Error('Marker ' + markers[0] + ' tidak ditemukan di index.html.');
  return html.slice(0, a + markers[0].length) + '\n' + inner + '\n' + html.slice(b);
}

function seoHead(paket, kelas) {
  return [businessLd(paket, kelas), siteLd(), faqLd()].map(ld).join('\n');
}
// Real, visible text for people without JavaScript (and for crawlers that read <noscript>).
function seoBody(paket, kelas) {
  const li = paket.packages.slice(0, 12).map(p => '<li>' + esc(p.namaPaket) + ': ' + rupiah(p.harga) + (p.jumlahSesi ? ' (' + p.jumlahSesi + ' sesi)' : '') + '</li>').join('');
  return '<noscript><main style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;line-height:1.6">' +
    '<h1>' + COACH + ' · Personal Trainer ' + AREAS.join(' &amp; ') + '</h1>' +
    '<p>Personal training berbasis sport science: ' + PROGRAMS.map(esc).join(', ') + '. 1 sesi trial gratis.</p>' +
    (li ? '<h2>Paket</h2><ul>' + li + '</ul>' : '') +
    '<p><a href="/harga/">Lihat semua harga</a>' + (kelas.length ? ' · <a href="/kelas/">Kelas</a>' : '') + ' · <a href="' + BOOK_URL + '">Booking</a> · <a href="' + waLink('Halo Coach Jizdan, saya mau tanya program personal training.') + '">WhatsApp</a></p>' +
    '</main></noscript>';
}

function renderIndex(html, paket, kelas) {
  return between(between(html, SEO_HEAD, seoHead(paket, kelas)), SEO_BODY, seoBody(paket, kelas));
}

// ── sitemap, robots, llms.txt ────────────────────────────────────────────────

function buildSitemap(paket, kelas) {
  // lastmod follows the price data (not the build date), so a rebuild with no change yields an identical file.
  const lm = paket.updatedAt ? '<lastmod>' + String(paket.updatedAt).slice(0, 10) + '</lastmod>' : '';
  const urls = [['/', '1.0'], ['/harga/', '0.9']];
  if (!paket.packages.length) urls.splice(1, 1);
  if (kelas.length) urls.push(['/kelas/', '0.7']);
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => '  <url><loc>' + BASE + u[0] + '</loc>' + lm + '<priority>' + u[1] + '</priority></url>').join('\n') + '\n</urlset>\n';
}
function buildRobots() {
  return 'User-agent: *\nAllow: /\n\nSitemap: ' + BASE + '/sitemap.xml\n';
}
function buildLlms(paket, kelas) {
  const lines = [
    '# ' + NAME, '',
    '> ' + COACH + ' adalah personal trainer berbasis sport science di ' + AREAS.join(' dan ') + ', Jawa Tengah, Indonesia. Program: ' + PROGRAMS.join(', ') + '. Tersedia 1 sesi trial gratis.', '',
    '## Halaman', '',
    '- [Beranda](' + BASE + '/): profil coach, program, jadwal slot kosong, FAQ',
    '- [Harga](' + BASE + '/harga/): daftar paket dan harga (Rupiah)'
  ];
  if (kelas.length) lines.push('- [Kelas](' + BASE + '/kelas/): jadwal dan harga kelas');
  lines.push('- [Booking klien](' + BOOK_URL + '): login dengan nomor WhatsApp dan booking sesi', '');
  if (paket.packages.length) {
    lines.push('## Paket', '');
    paket.groups.forEach(g => {
      lines.push('### ' + g.label, '');
      g.packages.forEach(p => lines.push('- ' + p.namaPaket + ': ' + rupiah(p.harga) + (p.jumlahSesi ? ', ' + p.jumlahSesi + ' sesi' : ', unlimited') + (p.durasi ? ', ' + p.durasi : '')));
      lines.push('');
    });
  }
  if (kelas.length) {
    lines.push('## Kelas', '');
    kelas.forEach(k => lines.push('- ' + k.nama + (k.jadwal ? ': ' + k.jadwal : '') + (Number(k.harga) > 0 ? ', ' + rupiah(k.harga) : '')));
    lines.push('');
  }
  lines.push('## Kontak', '', '- WhatsApp: +' + WA_NUMBER, '- Lokasi: ' + AREAS.join(', '), '');
  return lines.join('\n');
}

// ── run ──────────────────────────────────────────────────────────────────────

function build(files) {
  const paket = cleanPaket(files.paket), kelas = cleanKelas(files.kelas);
  return {
    'index.html': renderIndex(files.index, paket, kelas),
    'harga/index.html': buildHarga(paket, kelas),
    'kelas/index.html': buildKelas(paket, kelas),
    'sitemap.xml': buildSitemap(paket, kelas),
    'robots.txt': buildRobots(),
    'llms.txt': buildLlms(paket, kelas)
  };
}

function main() {
  const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const out = build({ index: read('index.html'), paket: JSON.parse(read('data/paket.json')), kelas: JSON.parse(read('data/kelas.json')) });
  Object.keys(out).forEach(f => {
    const full = path.join(ROOT, f);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, out[f]);
  });
  console.log('Dibangun: ' + Object.keys(out).join(', '));
}

if (require.main === module) main();
module.exports = { build, cleanPaket, cleanKelas, businessLd, buildSitemap, renderIndex, esc };
