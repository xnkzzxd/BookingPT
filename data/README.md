# Data halaman statis

- `paket.json` **jangan diedit tangan**. Isinya cermin dari Google Sheet (Pengaturan → Paket & Harga di panel).
  GitHub Action `Sinkron harga` mengambilnya dari `/exec?view=prices` lalu membangun ulang `/harga`.
- `kelas.json` diisi manual. Setiap kelas:

```json
{
  "id": "kelas-pagi",
  "nama": "Nama kelas",
  "deskripsi": "1-2 kalimat.",
  "jadwal": "Senin & Kamis, 06.00",
  "durasi": "60 menit",
  "level": "Pemula",
  "kapasitas": 8,
  "harga": 150000,
  "lokasi": "Banjarnegara",
  "aktif": true
}
```

`harga`, `kapasitas`, `level`, `lokasi` boleh dikosongkan. Selama daftar kosong, `/kelas` tidak diindeks Google dan tidak masuk sitemap.
