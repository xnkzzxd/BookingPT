'use strict';
// Copy for the keyword pages. Everything here is shown to visitors and read by Google: keep it true.
// Facts come from the landing page (coach background, programs, 4-step method, trial, payment, rescheduling).
// Local details (gym name, address) come from data/lokasi.json; nothing about a place is invented here.
// {gym} and {alamatGym} are filled by tools/build.js from data/lokasi.json (a neutral phrase when it is empty).

const CITIES = {
  purwokerto: {
    slug: 'personal-trainer-purwokerto',
    nama: 'Purwokerto',
    other: 'banjarnegara',
    title: 'Personal Trainer Purwokerto (PT Gym) · Coach Jizdan | Trial Gratis',
    h1: 'Personal Trainer Purwokerto',
    description: 'PT gym & personal trainer Purwokerto: Coach Jizdan, guru PJOK & pelatih pencak silat. Latihan di gym atau ke rumah. Fat loss, otot, strength. Trial gratis.',
    lead: 'Cari personal trainer di Purwokerto yang programnya disusun dari assessment, bukan ikut tren sesaat? Coach Jizdan, guru pendidikan jasmani dan pelatih pencak silat bersertifikat, mendampingi kamu 1-on-1 dari konsultasi, assessment tubuh, latihan, sampai evaluasi progres. Latihan bisa di {gym} atau coach datang ke rumahmu.',
    whyTitle: 'Kenapa latihan dengan personal trainer di Purwokerto bersama Coach Jizdan',
    faq: [
      ['Berapa tarif personal trainer di Purwokerto?', ctx => 'Tarif mengikuti paket latihan' + (ctx.low ? ', mulai dari ' + ctx.low : '') + '. Ada paket pelajar, mahasiswa, umum, dan premium. Semua harga tercantum di halaman harga, tanpa biaya tersembunyi.'],
      ['Apakah ada sesi trial gratis di Purwokerto?', () => 'Ada. Calon klien baru mendapat 1 sesi trial gratis untuk merasakan latihan bersama coach sebelum memutuskan memilih paket.'],
      ['Saya pemula dan belum pernah ke gym. Apakah cocok?', () => 'Cocok. Program dirancang untuk semua level, dari pemula total sampai atlet. Intensitas dan kompleksitas latihan disesuaikan dengan kemampuanmu.'],
      ['Apa bedanya PT gym, coach gym, dan personal trainer?', () => 'Sama saja. PT adalah singkatan dari personal trainer, yang juga sering disebut coach gym, pelatih gym, pelatih fitness, atau private trainer: pelatih yang mendampingi latihanmu secara pribadi (1-on-1) dengan program yang disusun khusus untukmu.'],
      ['Di mana lokasi latihan personal trainer di Purwokerto?', () => 'Latihan tatap muka di Purwokerto berlangsung di {alamatGym}. Coach juga bisa datang ke rumahmu di Purwokerto dan sekitarnya; area dan jadwalnya dikonfirmasi lewat WhatsApp.'],
      ['Bagaimana cara booking personal trainer di Purwokerto?', () => 'Daftar atau masuk dengan nomor WhatsApp di halaman booking, pilih jam yang masih kosong, lalu sesi tercatat. Jam kosong ditampilkan langsung dari jadwal coach.'],
      ['Saya sedang tidak di Purwokerto. Bisa latihan online?', () => 'Bisa. Coach Jizdan juga melayani personal training online. Lihat halaman personal trainer online untuk cara kerjanya.']
    ]
  },
  banyumas: {
    slug: 'personal-trainer-banyumas',
    nama: 'Banyumas',
    lokasiKey: 'purwokerto',
    served: ['Kabupaten Banyumas', 'Purwokerto', 'Sokaraja', 'Baturraden'],
    eyebrow: 'Kabupaten Banyumas · Purwokerto, Sokaraja, Baturraden',
    title: 'PT Gym & Personal Trainer Banyumas · Coach Jizdan | Trial Gratis',
    h1: 'Personal Trainer Banyumas',
    description: 'PT gym & coach gym di Banyumas: Purwokerto, Sokaraja, Baturraden. Coach Jizdan latih 1-on-1 di gym atau datang ke rumah. Harga jelas, trial gratis.',
    lead: 'Cari PT gym atau coach gym di Kabupaten Banyumas? Coach Jizdan melatih 1-on-1 di {gym}, dan juga datang ke rumahmu di Purwokerto, Sokaraja, Baturraden, dan sekitarnya. Program disusun dari assessment, progres dicatat, dan harga tercantum jelas.',
    whyTitle: 'Kenapa memilih personal trainer di Banyumas bersama Coach Jizdan',
    areas: [
      ['Purwokerto', 'Latihan di {gym} atau di rumahmu. Lihat juga halaman personal trainer Purwokerto.'],
      ['Sokaraja', 'Coach datang ke rumah atau tempat latihanmu di Sokaraja, atau kamu berlatih di {gym}.'],
      ['Baturraden', 'Latihan di rumah, vila, atau ruang terbuka di Baturraden, atau di {gym}.'],
      ['Kecamatan lain di Banyumas', 'Tanyakan lewat WhatsApp. Kalau terlalu jauh untuk datang, ada pilihan personal training online.']
    ],
    faq: [
      ['Apakah ada PT gym di Banyumas?', () => 'Ada. Coach Jizdan adalah personal trainer (PT gym) di Kabupaten Banyumas. Sesi tatap muka berlangsung di {alamatGym}, atau coach datang ke rumahmu.'],
      ['Apakah coach gym bisa datang ke Sokaraja atau Baturraden?', () => 'Bisa. Coach melayani home visit di Sokaraja, Baturraden, dan sekitar Purwokerto. Jadwal dan lokasi dikonfirmasi lewat WhatsApp sebelum sesi.'],
      ['Berapa harga personal trainer di Banyumas?', ctx => 'Harga mengikuti paket' + (ctx.low ? ', mulai dari ' + ctx.low : '') + '. Ada paket pelajar, mahasiswa, umum, dan premium, semuanya tercantum di halaman harga.'],
      ['Saya pemula. Apakah bisa latihan dengan personal trainer?', () => 'Bisa. Program dirancang untuk semua level, dari yang belum pernah ke gym sampai atlet. Intensitas latihan disesuaikan dengan kemampuanmu.'],
      ['Apakah ada sesi trial gratis?', () => 'Ada. Calon klien baru mendapat 1 sesi trial gratis untuk merasakan latihan bersama coach sebelum memilih paket.']
    ]
  },
  banjarnegara: {
    slug: 'personal-trainer-banjarnegara',
    nama: 'Banjarnegara',
    other: 'purwokerto',
    title: 'Personal Trainer Banjarnegara (PT Gym) · Coach Jizdan | Trial Gratis',
    h1: 'Personal Trainer Banjarnegara',
    description: 'PT gym & personal trainer Banjarnegara: Coach Jizdan, guru PJOK & pelatih pencak silat. Bisa datang ke rumah. Fat loss, otot, strength. Trial gratis.',
    lead: 'Mau mulai latihan serius di Banjarnegara tapi bingung dari mana? Coach Jizdan menyusun program personal berdasarkan hasil assessment: komposisi tubuh, postur, mobilitas, kekuatan, dan daya tahan. Kamu didampingi langsung 1-on-1, dan progresmu dicatat supaya hasilnya terukur. Di Banjarnegara coach datang ke tempatmu; lokasi dan jadwal diatur lewat WhatsApp.',
    whyTitle: 'Kenapa memilih personal trainer di Banjarnegara bersama Coach Jizdan',
    faq: [
      ['Berapa harga personal trainer di Banjarnegara?', ctx => 'Harga mengikuti paket' + (ctx.low ? ', mulai dari ' + ctx.low : '') + '. Tersedia paket pelajar, mahasiswa, umum, dan premium. Daftar lengkapnya ada di halaman harga.'],
      ['Apakah bisa mencoba dulu sebelum membeli paket?', () => 'Bisa. Ada 1 sesi trial gratis untuk calon klien baru, jadi kamu bisa merasakan cara latihan dan pendampingan coach lebih dulu.'],
      ['Saya mahasiswa atau pelajar di Banjarnegara. Ada paket yang lebih hemat?', () => 'Ada paket khusus pelajar dan mahasiswa, termasuk opsi sesi satuan tanpa komitmen program. Cek halaman harga untuk detailnya.'],
      ['Apakah ada PT gym atau coach gym di Banjarnegara?', () => 'Ada. Coach Jizdan melayani personal training (sering disebut PT gym atau coach gym) di Banjarnegara. Karena tidak ada gym tetap di Banjarnegara, coach datang ke rumahmu atau tempat latihan yang kamu pilih; atur lokasinya lewat WhatsApp.'],
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
  'Latihan di gym atau coach datang ke rumahmu (home visit).',
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

// Answers to the question people actually type about the site. Facts only; no mention of any third-party thread.
const TRUST_FAQ = [
  ['Apakah xnkbooking.my.id resmi dan aman?', 'Ya. xnkbooking.my.id adalah situs resmi XNK Personal Training milik Coach Jizdan (' + COACH_FULL_NAME + '), personal trainer di Purwokerto dan Banjarnegara. Situs ini hanya untuk melihat paket, jadwal kosong, dan booking sesi latihan. Situs ini tidak memproses pembayaran dan tidak pernah meminta kata sandi, PIN, kode OTP, atau data kartu. Kamu bisa memverifikasi lewat Instagram @jiz.dan, pemberitaan UNSOED dan ANTARA Jateng tentang Coach Jizdan, atau menghubungi coach langsung lewat WhatsApp.'],
  ['Apakah ada pembayaran lewat situs ini?', 'Tidak. Pembayaran paket dilakukan langsung kepada coach setelah kamu sepakat dengan paketnya. Kalau ada pihak lain meminta transfer atas nama XNK Personal Training, hubungi coach lewat WhatsApp resmi +62 882-2125-4305 sebelum membayar.']
];

// Home visits: confirmed by the owner (gym + home visits). Travel cost and equipment are not fixed facts,
// so the copy sends those questions to WhatsApp instead of stating a number.
const HOME = {
  slug: 'personal-trainer-ke-rumah',
  title: 'Personal Trainer ke Rumah Purwokerto & Banyumas · Coach Jizdan',
  h1: 'Personal Trainer ke Rumah (Private Trainer Panggilan)',
  description: 'Personal trainer ke rumah di Purwokerto, Sokaraja, Baturraden, Banyumas & Banjarnegara. Private trainer panggilan 1-on-1 bersama Coach Jizdan. Trial gratis.',
  lead: 'Tidak sempat ke gym, malu latihan di tempat ramai, atau ingin privasi penuh? Coach Jizdan bisa datang ke rumahmu sebagai private trainer panggilan. Metodenya sama dengan sesi di gym: konsultasi, assessment, program personal, dan evaluasi progres.',
  areas: ['Purwokerto', 'Sokaraja', 'Baturraden', 'Kabupaten Banyumas', 'Banjarnegara'],
  how: [
    ['Chat dulu lewat WhatsApp', 'Ceritakan target, lokasi rumahmu, dan jam yang kamu mau. Coach memastikan area dan jadwalnya bisa dijangkau.'],
    ['Assessment di rumah', 'Sesi pertama dipakai untuk mengenal kondisi tubuhmu dan melihat ruang serta alat yang ada di rumah.'],
    ['Program sesuai ruang dan alat', 'Latihan disusun dari apa yang tersedia: berat badan sendiri, dumbel, resistance band, atau alat yang kamu punya.'],
    ['Progres dicatat', 'Berat badan, lingkar tubuh, dan foto progres dicatat di portal klien, lalu program disesuaikan berkala.']
  ],
  forWho: [
    'Kamu ingin latihan dengan privasi, tanpa keramaian gym.',
    'Jadwalmu padat dan waktu perjalanan ke gym terasa berat.',
    'Kamu pemula dan ingin belajar gerakan yang benar dengan tenang.',
    'Kamu ingin latihan bareng pasangan, keluarga, atau teman di rumah.'
  ],
  faq: [
    ['Apakah personal trainer bisa datang ke rumah?', () => 'Bisa. Coach Jizdan melayani personal training ke rumah (home visit) di Purwokerto, Sokaraja, Baturraden, sekitar Kabupaten Banyumas, dan Banjarnegara. Area dan jadwal dikonfirmasi lewat WhatsApp sebelum sesi.'],
    ['Apakah saya harus punya alat gym di rumah?', () => 'Tidak harus. Program disesuaikan dengan ruang dan alat yang ada, termasuk latihan dengan berat badan sendiri. Kalau kamu punya alat seperti dumbel atau resistance band, program akan memakainya.'],
    ['Berapa harga personal trainer ke rumah?', ctx => 'Harga dasar mengikuti paket di halaman harga' + (ctx.low ? ' (mulai dari ' + ctx.low + ')' : '') + '. Untuk home visit, ada tidaknya biaya transport tergantung jarak dan dikonfirmasi lebih dulu lewat WhatsApp, jadi tidak ada biaya kejutan.'],
    ['Apakah bisa latihan berdua atau bersama keluarga di rumah?', () => 'Tanyakan lewat WhatsApp. Coach akan menyesuaikan format sesi dan paketnya dengan jumlah peserta dan targetmu.'],
    ['Apakah ada trial untuk personal trainer ke rumah?', () => 'Calon klien baru mendapat 1 sesi trial gratis. Untuk trial di rumah, atur lokasi dan jamnya lewat WhatsApp.']
  ]
};

// Goal pages. General training knowledge plus the coach's own method (STEPS); no promised results or numbers.
const PROGRAM_PAGES = {
  'fat-loss': {
    name: 'Fat Loss',
    title: 'Program Fat Loss & Diet Purwokerto · Personal Trainer | XNK',
    h1: 'Program Fat Loss & Diet bersama Personal Trainer',
    description: 'Program fat loss & diet bersama personal trainer di Purwokerto, Banyumas & Banjarnegara: latihan terarah, pola makan realistis, progres terukur. Trial gratis.',
    lead: 'Mau turun berat badan dan lemak tubuh tanpa diet ekstrem? Program fat loss Coach Jizdan menggabungkan latihan kekuatan, kardio yang terukur, dan kebiasaan makan yang realistis, disusun dari hasil assessment tubuhmu.',
    forWho: ['Kamu ingin menurunkan berat badan atau lemak tubuh dengan cara yang bisa dipertahankan.', 'Kamu sudah sering mencoba diet tapi berat badan kembali naik.', 'Kamu ingin tahu latihan apa yang tepat, bukan sekadar banyak kardio.'],
    contains: ['Latihan kekuatan untuk menjaga massa otot selama defisit kalori.', 'Kardio dan aktivitas harian yang diatur bertahap.', 'Panduan kebiasaan makan yang realistis, bukan menu ekstrem.', 'Pemantauan berat badan, lingkar pinggang, dan foto progres di portal klien.'],
    faq: [
      ['Apakah program fat loss harus diet ketat?', () => 'Tidak. Fokusnya kebiasaan makan yang realistis dan bisa dijalani lama, dipadukan dengan latihan. Diet ekstrem cenderung sulit dipertahankan.'],
      ['Berapa kali latihan seminggu untuk fat loss?', () => 'Frekuensinya disesuaikan dengan jadwal dan kondisimu saat konsultasi. Jumlah sesi per bulan mengikuti paket yang kamu pilih.'],
      ['Apakah bisa fat loss dengan latihan di rumah?', () => 'Bisa. Coach bisa datang ke rumahmu atau mendampingi secara online, dan program disesuaikan dengan alat yang kamu punya.'],
      ['Berapa harga program fat loss?', ctx => 'Program fat loss memakai paket personal training biasa' + (ctx.low ? ', mulai dari ' + ctx.low : '') + '. Lihat halaman harga untuk daftar lengkapnya.']
    ]
  },
  'muscle-building': {
    name: 'Muscle Building',
    title: 'Program Muscle Building Purwokerto · Bentuk Otot | XNK',
    h1: 'Program Muscle Building (Bentuk Otot) bersama Personal Trainer',
    description: 'Program muscle building di Purwokerto, Banyumas & Banjarnegara: bentuk otot dan naik massa dengan progresi beban dan teknik benar, 1-on-1. Trial gratis.',
    lead: 'Ingin badan lebih berisi dan otot terbentuk? Program muscle building Coach Jizdan memakai progresi beban yang terukur dan teknik yang benar, supaya otot tumbuh dan risiko cedera tetap rendah.',
    forWho: ['Kamu ingin menambah massa otot atau membentuk badan.', 'Kamu sudah nge-gym tapi progres terasa mentok.', 'Kamu pemula dan ingin belajar teknik angkat beban yang aman.'],
    contains: ['Program latihan beban dengan progresi yang dicatat dari sesi ke sesi.', 'Koreksi teknik gerakan dasar seperti squat, deadlift, press, dan row.', 'Panduan asupan protein dan pola makan untuk mendukung pertumbuhan otot.', 'Evaluasi berkala lewat ukuran tubuh dan catatan kekuatan.'],
    faq: [
      ['Apakah pemula bisa ikut program muscle building?', () => 'Bisa. Program dimulai dari teknik dasar dan beban yang sesuai, lalu dinaikkan bertahap.'],
      ['Apakah perempuan cocok ikut program muscle building?', () => 'Cocok. Latihan beban membantu membentuk tubuh, memperkuat otot dan tulang, dan tidak otomatis membuat badan terlihat besar.'],
      ['Apakah harus latihan di gym?', () => 'Hasil terbaik untuk menambah massa otot biasanya di gym karena alat bebannya lengkap. Latihan di rumah tetap bisa, dengan program yang disesuaikan alat yang ada.'],
      ['Berapa harga program muscle building?', ctx => 'Program ini memakai paket personal training biasa' + (ctx.low ? ', mulai dari ' + ctx.low : '') + '. Lihat halaman harga.']
    ]
  },
  'strength-conditioning': {
    name: 'Strength & Conditioning',
    title: 'Strength & Conditioning Purwokerto · Personal Trainer | XNK',
    h1: 'Program Strength & Conditioning bersama Personal Trainer',
    description: 'Strength & conditioning di Purwokerto, Banyumas & Banjarnegara: tingkatkan kekuatan, daya tahan, dan kebugaran fungsional, didampingi 1-on-1. Trial gratis.',
    lead: 'Ingin lebih kuat, tidak cepat lelah, dan tubuh terasa lebih siap untuk aktivitas sehari-hari? Program strength & conditioning melatih kekuatan, daya tahan, mobilitas, dan kualitas gerak secara seimbang.',
    forWho: ['Kamu ingin badan lebih kuat dan bugar untuk aktivitas sehari-hari.', 'Kamu bekerja duduk lama dan ingin memperbaiki postur dan mobilitas.', 'Kamu ingin kebugaran fungsional, bukan sekadar penampilan.'],
    contains: ['Latihan kekuatan dengan gerakan dasar dan progresi beban.', 'Latihan conditioning untuk daya tahan jantung dan otot.', 'Mobilitas dan kontrol gerak untuk mengurangi risiko cedera.', 'Tes kebugaran berkala untuk melihat kemajuan.'],
    faq: [
      ['Apa itu strength & conditioning?', () => 'Strength & conditioning adalah latihan yang membangun kekuatan (strength) dan kapasitas fisik seperti daya tahan, kecepatan, dan mobilitas (conditioning), supaya tubuh lebih siap untuk aktivitas dan olahraga.'],
      ['Apakah cocok untuk usia 40 tahun ke atas?', () => 'Cocok. Intensitas dan pilihan gerakan disesuaikan dengan kondisi dan riwayat kesehatan yang dibahas saat konsultasi dan assessment.'],
      ['Berapa lama sampai terasa lebih kuat?', () => 'Setiap orang berbeda. Progres dicatat sejak assessment pertama supaya perubahannya terlihat jelas.'],
      ['Berapa harga program strength & conditioning?', ctx => 'Program ini memakai paket personal training biasa' + (ctx.low ? ', mulai dari ' + ctx.low : '') + '. Lihat halaman harga.']
    ]
  },
  'sports-performance': {
    name: 'Sports Performance',
    title: 'Latihan Sports Performance & Atlet Purwokerto | XNK',
    h1: 'Program Sports Performance untuk Atlet',
    description: 'Latihan fisik untuk atlet dan pegiat olahraga di Purwokerto, Banyumas & Banjarnegara: kekuatan, kecepatan, daya tahan, pencegahan cedera. Bersama Coach Jizdan.',
    lead: 'Ingin performa olahragamu naik? Coach Jizdan, pelatih pencak silat bersertifikat dengan latar pendidikan jasmani, menyusun latihan fisik yang mendukung cabang olahragamu: kekuatan, kecepatan, daya tahan, dan pencegahan cedera.',
    forWho: ['Atlet pelajar, mahasiswa, atau klub yang butuh persiapan fisik.', 'Pegiat olahraga seperti lari, futsal, badminton, atau bela diri.', 'Kamu ingin kembali berlatih dengan aman setelah lama vakum.'],
    contains: ['Analisis kebutuhan fisik cabang olahragamu.', 'Latihan kekuatan, power, kecepatan, dan kelincahan.', 'Conditioning yang sesuai pola kerja olahragamu.', 'Latihan pencegahan cedera dan pemulihan.'],
    faq: [
      ['Apakah program ini untuk atlet saja?', () => 'Tidak. Program ini cocok untuk siapa saja yang ingin performa olahraganya meningkat, dari pemula sampai atlet.'],
      ['Apakah bisa untuk persiapan tes fisik atau kejuaraan?', () => 'Bisa. Ceritakan jadwal dan jenis tesnya saat konsultasi, lalu program disusun mundur dari tanggal itu.'],
      ['Apakah coach berpengalaman di bela diri?', () => 'Ya. Coach Jizdan adalah pelatih pencak silat bersertifikat dan guru pendidikan jasmani.'],
      ['Berapa harga program sports performance?', ctx => 'Program ini memakai paket personal training biasa' + (ctx.low ? ', mulai dari ' + ctx.low : '') + '. Lihat halaman harga.']
    ]
  }
};

// Other words people type for the same service. Shown once per keyword page as a plain sentence.
const ALIASES = 'Dikenal juga sebagai PT gym, coach gym, pelatih gym, pelatih fitness, atau private trainer.';

module.exports = { HOME, PROGRAM_PAGES, ALIASES, TRUST_FAQ, CITIES, WHY, STEPS, PROGRAM_TEXT, ONLINE, COACH_FULL_NAME, COACH_BIO, COACH_SOURCES };
