'use strict';
// Copy for the keyword pages. Everything here is shown to visitors and read by Google: keep it true.
// Facts come from the landing page (coach background, programs, 4-step method, trial, payment, rescheduling).
// Local details (gym name, address) come from data/lokasi.json; nothing about a place is invented here.

const CITIES = {
  purwokerto: {
    slug: 'personal-trainer-purwokerto',
    nama: 'Purwokerto',
    other: 'banjarnegara',
    title: 'Personal Trainer Purwokerto · Coach Jizdan | Trial Gratis',
    h1: 'Personal Trainer Purwokerto',
    description: 'Personal trainer Purwokerto: Coach Jizdan, guru PJOK & pelatih pencak silat bersertifikat. Fat loss, muscle building, strength. Harga jelas, trial gratis.',
    lead: 'Cari personal trainer di Purwokerto yang programnya disusun dari assessment, bukan ikut tren sesaat? Coach Jizdan, guru pendidikan jasmani dan pelatih pencak silat bersertifikat, mendampingi kamu 1-on-1 dari konsultasi, assessment tubuh, latihan, sampai evaluasi progres.',
    whyTitle: 'Kenapa latihan dengan personal trainer di Purwokerto bersama Coach Jizdan',
    faq: [
      ['Berapa tarif personal trainer di Purwokerto?', ctx => 'Tarif mengikuti paket latihan' + (ctx.low ? ', mulai dari ' + ctx.low : '') + '. Ada paket pelajar, mahasiswa, umum, dan premium. Semua harga tercantum di halaman harga, tanpa biaya tersembunyi.'],
      ['Apakah ada sesi trial gratis di Purwokerto?', () => 'Ada. Calon klien baru mendapat 1 sesi trial gratis untuk merasakan latihan bersama coach sebelum memutuskan memilih paket.'],
      ['Saya pemula dan belum pernah ke gym. Apakah cocok?', () => 'Cocok. Program dirancang untuk semua level, dari pemula total sampai atlet. Intensitas dan kompleksitas latihan disesuaikan dengan kemampuanmu.'],
      ['Bagaimana cara booking personal trainer di Purwokerto?', () => 'Daftar atau masuk dengan nomor WhatsApp di halaman booking, pilih jam yang masih kosong, lalu sesi tercatat. Jam kosong ditampilkan langsung dari jadwal coach.'],
      ['Saya sedang tidak di Purwokerto. Bisa latihan online?', () => 'Bisa. Coach Jizdan juga melayani personal training online. Lihat halaman personal trainer online untuk cara kerjanya.']
    ]
  },
  banjarnegara: {
    slug: 'personal-trainer-banjarnegara',
    nama: 'Banjarnegara',
    other: 'purwokerto',
    title: 'Personal Trainer Banjarnegara · Coach Jizdan | Trial Gratis',
    h1: 'Personal Trainer Banjarnegara',
    description: 'Personal trainer Banjarnegara: Coach Jizdan, guru PJOK & pelatih pencak silat bersertifikat. Fat loss, muscle building, strength. Harga jelas, trial gratis.',
    lead: 'Mau mulai latihan serius di Banjarnegara tapi bingung dari mana? Coach Jizdan menyusun program personal berdasarkan hasil assessment: komposisi tubuh, postur, mobilitas, kekuatan, dan daya tahan. Kamu didampingi langsung 1-on-1, dan progresmu dicatat supaya hasilnya terukur.',
    whyTitle: 'Kenapa memilih personal trainer di Banjarnegara bersama Coach Jizdan',
    faq: [
      ['Berapa harga personal trainer di Banjarnegara?', ctx => 'Harga mengikuti paket' + (ctx.low ? ', mulai dari ' + ctx.low : '') + '. Tersedia paket pelajar, mahasiswa, umum, dan premium. Daftar lengkapnya ada di halaman harga.'],
      ['Apakah bisa mencoba dulu sebelum membeli paket?', () => 'Bisa. Ada 1 sesi trial gratis untuk calon klien baru, jadi kamu bisa merasakan cara latihan dan pendampingan coach lebih dulu.'],
      ['Saya mahasiswa atau pelajar di Banjarnegara. Ada paket yang lebih hemat?', () => 'Ada paket khusus pelajar dan mahasiswa, termasuk opsi sesi satuan tanpa komitmen program. Cek halaman harga untuk detailnya.'],
      ['Kalau berhalangan hadir, bisa ganti jadwal?', () => 'Bisa. Hubungi coach lewat WhatsApp minimal 2 jam sebelum sesi untuk reschedule tanpa penalti.'],
      ['Apakah ada latihan online untuk yang di Banjarnegara?', () => 'Ada. Personal training online tersedia untuk kamu yang jadwalnya padat atau tidak bisa datang langsung. Lihat halaman personal trainer online.']
    ]
  }
};

const WHY = [
  'Pendampingan 1-on-1 dari awal sampai sesi selesai, bukan latihan massal.',
  'Program dibuat dari hasil assessment: komposisi tubuh, postur, mobilitas, kekuatan, dan kualitas gerak.',
  'Pendekatan edukatif: kamu belajar memahami tubuhmu sendiri, bukan bergantung pada coach.',
  'Progres terukur: berat badan, lingkar tubuh, dan foto progres tercatat di portal klien.',
  'Pengingat jadwal lewat WhatsApp supaya latihan tidak terlewat.',
  '1 sesi trial gratis untuk calon klien baru.'
];

const STEPS = [
  ['Consultation', 'Diskusi target yang ingin dicapai, riwayat latihan, kondisi kesehatan, jadwal harian, dan hambatan yang sering dihadapi.'],
  ['Assessment', 'Evaluasi komposisi tubuh, postur, mobilitas, kekuatan, daya tahan, dan kualitas gerak untuk menentukan titik awal latihan.'],
  ['Training', 'Program dijalankan lewat sesi personal training dengan pendampingan langsung dari coach 1-on-1.'],
  ['Monitoring & Evaluation', 'Progres dipantau berkala dan program disesuaikan supaya hasil tetap optimal dan berkelanjutan.']
];

const PROGRAM_TEXT = {
  'Fat Loss': 'Turunkan lemak tubuh dengan program latihan dan kebiasaan harian yang realistis.',
  'Muscle Building': 'Bangun massa otot dengan progresi beban dan teknik yang benar.',
  'Strength & Conditioning': 'Tingkatkan kekuatan, daya tahan, dan kebugaran fungsional.',
  'Sports Performance': 'Latihan untuk menunjang performa cabang olahraga dan atlet.'
};

const ONLINE = {
  slug: 'personal-trainer-online',
  title: 'Personal Trainer Online Purwokerto & Banjarnegara · Coach Jizdan',
  h1: 'Personal Trainer Online Purwokerto & Banjarnegara',
  description: 'Personal trainer online Coach Jizdan untuk Purwokerto, Banjarnegara, dan seluruh Indonesia: program personal, sesi video, progres terukur. Trial gratis.',
  lead: 'Jadwal padat atau tidak bisa datang langsung? Latihan online bersama Coach Jizdan tetap memakai metode yang sama: konsultasi, assessment, program personal, dan evaluasi progres. Cocok untuk kamu di Purwokerto, Banjarnegara, maupun kota lain.',
  how: [
    ['Konsultasi online', 'Kamu menceritakan target, riwayat latihan, kondisi kesehatan, dan jadwal. Coach menentukan arah program.'],
    ['Program personal', 'Program disusun dari kebutuhanmu, bukan template. Disesuaikan dengan alat dan tempat latihan yang kamu punya.'],
    ['Sesi dan koreksi teknik', 'Latihan didampingi coach lewat video, lengkap dengan koreksi teknik dan penjelasan gerakan.'],
    ['Progres terukur', 'Berat badan, lingkar tubuh, dan foto progres dicatat di portal klien, lalu dievaluasi berkala.']
  ],
  forWho: [
    'Kamu di Purwokerto atau Banjarnegara tapi jadwalnya sulit untuk datang ke sesi tatap muka.',
    'Kamu sedang di luar kota, merantau, atau bekerja dengan jam yang tidak menentu.',
    'Kamu ingin program terarah dengan pendampingan, tapi nyaman berlatih di tempat sendiri.'
  ],
  faq: [
    ['Apa itu personal trainer online?', () => 'Personal trainer online adalah pendampingan latihan 1-on-1 dari jarak jauh: program personal, sesi lewat video, koreksi teknik, dan evaluasi progres, tanpa harus bertemu langsung.'],
    ['Apakah personal trainer online bisa dari Purwokerto atau Banjarnegara?', () => 'Bisa. Kamu tetap berlatih di kotamu, dan coach mendampingi lewat sesi online. Kalau suatu saat ingin tatap muka, kamu bisa beralih ke sesi langsung.'],
    ['Apakah saya perlu alat gym lengkap?', () => 'Tidak harus. Program disesuaikan dengan alat dan tempat latihan yang kamu punya. Sampaikan kondisimu saat konsultasi.'],
    ['Berapa harga personal trainer online?', () => 'Harga paket online dikonfirmasi saat konsultasi, karena menyesuaikan target dan frekuensi sesi. Konsultasi awalnya gratis lewat WhatsApp.'],
    ['Apakah ada trial untuk latihan online?', () => 'Calon klien baru mendapat 1 sesi trial gratis. Tanyakan lewat WhatsApp untuk mengatur jadwal trial online.']
  ]
};

// Credentials come from the owner's confirmation and the two public articles below. Do not go beyond them.
const COACH_FULL_NAME = 'Yandura Jizdan Hasya Husnayain';
const COACH_BIO = [
  'Coach Jizdan (' + COACH_FULL_NAME + ') berlatar belakang pendidikan jasmani di Universitas Jenderal Soedirman (UNSOED), Purwokerto.',
  'Pada 2023 ia memimpin tim UNSOED meraih Juara 2 (runner-up 1) Senam Virtual UMPP, kategori grup putra (aerobik lagu bebas).',
  'Ia guru pendidikan jasmani dan pelatih pencak silat bersertifikat, dengan pengalaman melatih pemula, pelajar, mahasiswa, pekerja kantoran, hingga atlet.'
];
const COACH_SOURCES = [
  { name: 'UNSOED: Delegasi UNSOED raih prestasi Senam Virtual 2023', url: 'https://old.unsoed.ac.id/id/delegasi-unsoed-raih-prestasi-senam-virtual-2023' },
  { name: 'ANTARA Jateng: Mahasiswa Unsoed Purwokerto raih prestasi Senam Virtual 2023', url: 'https://jateng.antaranews.co/berita/487353/mahaiswa-unsoed-purwokerto-raih-prestasi-senam-virtual-2023' }
];

module.exports = { CITIES, WHY, STEPS, PROGRAM_TEXT, ONLINE, COACH_FULL_NAME, COACH_BIO, COACH_SOURCES };
