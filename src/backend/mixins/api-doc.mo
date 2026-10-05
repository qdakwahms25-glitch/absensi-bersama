mixin () {
  public query func getApiDoc() : async Text {
    "# API Backend — Absensi Belajar Bersama\n\n" #
    "Backend canister untuk modul **Absensi Belajar Bersama**. Menyimpan data master\n" #
    "(peserta, mata pelajaran), sesi pertemuan, absensi, dan menyediakan rekap serta\n" #
    "ringkasan dashboard. Seluruh data disimpan dalam stable state dan bertahan\n" #
    "lintas upgrade.\n\n" #
    "## Autentikasi & Otorisasi\n\n" #
    "Aplikasi memakai Internet Identity. Frontend memakai derivation origin aplikasi\n" #
    "yang dipublikasikan di `/.well-known/ii-derivation-origin`; agen yang sudah\n" #
    "memegang otorisasi Internet Identity pengguna menurunkan principal per-aplikasi\n" #
    "yang benar terhadap origin tersebut (mis. `icp identity link web <name> --app\n" #
    "<host>`). Delegasi semacam itu bertindak dengan otoritas penuh pengguna di\n" #
    "aplikasi ini sampai kedaluwarsa.\n\n" #
    "Registrasi terjadi saat pemanggil pertama kali masuk melalui frontend aplikasi.\n" #
    "Pemanggil pertama yang terautentikasi menjadi **admin**; pemanggil berikutnya\n" #
    "menjadi **user**. Pemanggil yang belum pernah masuk lewat frontend aplikasi\n" #
    "belum terdaftar — termasuk principal yang berasal dari origin berbeda — dan\n" #
    "akan menerima trap `Unauthorized` pada endpoint yang dijaga.\n\n" #
    "Peran aplikasi:\n" #
    "- **Admin** (ketua divisi): seluruh fitur.\n" #
    "- **Ketua halaqah / pengurus**: mengisi absensi kelompoknya (peran `user`).\n" #
    "- **Anggota**: hanya melihat rekap kehadirannya sendiri.\n" #
    "- **Anonim / tamu**: tidak dapat mengubah data; endpoint yang dijaga menolak.\n\n" #
    "Endpoint yang memerlukan pemanggil terautentikasi (non-anonim) akan memanggil\n" #
    "`Runtime.trap` dengan pesan berbahasa Indonesia bila tidak berwenang.\n\n" #
    "## Data Master\n\n" #
    "### Peserta\n" #
    "Peserta hanya menyimpan `nama` dan `kelompokId` — tanpa data pribadi lain.\n\n" #
    "- `listPeserta(filter : PesertaFilter) : async [Peserta]` — daftar peserta,\n" #
    "  dapat difilter berdasarkan `nama` (pencocokan substring, tidak peka huruf\n" #
    "  besar/kecil) dan `kelompokId`. Query.\n" #
    "- `getPeserta(id : PesertaId) : async ?Peserta` — satu peserta atau `null`.\n" #
    "  Query.\n" #
    "- `tambahPeserta(input : PesertaInput) : async Peserta` — **admin saja**.\n" #
    "- `ubahPeserta(id : PesertaId, input : PesertaInput) : async ?Peserta` —\n" #
    "  **admin saja**; `null` bila id tidak ada.\n" #
    "- `hapusPeserta(id : PesertaId) : async Bool` — **admin saja**; `true` bila\n" #
    "  terhapus.\n\n" #
    "### Mata Pelajaran\n" #
    "- `listMapel() : async [MataPelajaran]` — daftar mata pelajaran. Query.\n" #
    "- `tambahMapel(input : MapelInput) : async MataPelajaran` — **admin saja**.\n" #
    "- `ubahMapel(id : MapelId, input : MapelInput) : async ?MataPelajaran` —\n" #
    "  **admin saja**.\n" #
    "- `hapusMapel(id : MapelId) : async Bool` — **admin saja**.\n\n" #
    "## Sesi Pertemuan\n\n" #
    "Sesi menyimpan `tanggal`, `kelompokId`, `mapelId`, `pemateri`, `media`\n" #
    "(`#tatapMuka` / `#zoom` / `#whatsapp`), `tempat` opsional, jendela waktu\n" #
    "check-in (`jendelaMulai`, `jendelaSelesai`), dan `checkInToken` opsional.\n\n" #
    "- `listSesi(filter : SesiFilter) : async [Sesi]` — daftar sesi terurut menurut\n" #
    "  tanggal menaik; filter `kelompokId`, `mapelId`, `bulan` (1..12), `tahun`.\n" #
    "  Query.\n" #
    "- `getSesi(id : SesiId) : async ?Sesi` — Query.\n" #
    "- `detailSesi(id : SesiId) : async ?SesiDetail` — sesi beserta daftar peserta\n" #
    "  kelompoknya dan status absensinya (default `#hadir` bila belum diisi). Query.\n" #
    "- `buatSesi(input : SesiInput) : async Sesi` — **admin saja**.\n" #
    "- `ubahSesi(id : SesiId, input : SesiInput) : async ?Sesi` — **admin saja**;\n" #
    "  `checkInToken` yang sudah ada dipertahankan.\n" #
    "- `hapusSesi(id : SesiId) : async Bool` — **admin saja**.\n" #
    "- `duplikatSesi(input : DuplikatInput) : async [Sesi]` — **admin saja**;\n" #
    "  menduplikat satu sesi ke beberapa `tanggalTujuan` sekaligus. Token check-in\n" #
    "  tidak ikut disalin.\n\n" #
    "## Absensi\n\n" #
    "Status per peserta: `#hadir`, `#izin`, `#sakit`, `#alpa`, ditambah `catatan`.\n\n" #
    "- `simpanAbsensi(input : SimpanAbsensiInput) : async RingkasanStatus` —\n" #
    "  **pengurus (non-tamu) saja**; menyimpan absensi satu kelompok sekaligus.\n" #
    "  Admin boleh semua kelompok; pengurus lain hanya kelompok yang terdaftar\n" #
    "  untuknya (lihat `daftarkanKetuaHalaqah`). Bila kelompok sesi tidak diizinkan,\n" #
    "  trap `Anda hanya dapat mengisi absensi kelompok Anda`. Setiap item menimpa\n" #
    "  absensi peserta pada sesi tersebut (idempoten per sesi/peserta).\n" #
    "  Mengembalikan ringkasan status sesi.\n" #
    "- `getAbsensiSesi(sesiId : SesiId) : async [Absensi]` — Query.\n" #
    "- `ringkasanSesi(sesiId : SesiId) : async RingkasanStatus` — Query.\n" #
    "- `checkIn(input : CheckInInput) : async Absensi` — check-in mandiri peserta\n" #
    "  memakai `token` sesi. **Hanya berlaku selama jendela waktu sesi**\n" #
    "  (`jendelaMulai` .. `jendelaSelesai`); di luar itu trap\n" #
    "  `Di luar jendela waktu sesi`. Token tidak valid trap\n" #
    "  `Token check-in tidak valid`. Check-in mencatat status `#hadir` dan\n" #
    "  `dicatatOleh = null`. Aman dipanggil berulang: menimpa catatan yang ada.\n\n" #
    "### Registri ketua halaqah (dikelola admin)\n" #
    "- `daftarkanKetuaHalaqah(principal : Principal, kelompokId : KelompokId) :\n" #
    "  async ()` — **admin saja**; memberi seorang principal izin mengisi absensi\n" #
    "  kelompok tersebut (dapat dipanggil berulang untuk beberapa kelompok).\n" #
    "- `hapusKetuaHalaqah(principal : Principal) : async ()` — **admin saja**.\n" #
    "- `getKelompokSaya() : async [KelompokId]` — kelompok yang boleh dikelola\n" #
    "  pemanggil; `[]` bila tidak ada. Query.\n\n" #
    "## Rekap & Laporan\n\n" #
    "- `rekapPerPeserta(filter : RekapFilter) : async [RekapPeserta]` — persentase\n" #
    "  kehadiran per peserta; `diBawahAmbang` menandai peserta di bawah ambang.\n" #
    "  **Terbatas per peran**: admin melihat semua; anggota terdaftar hanya baris\n" #
    "  dirinya; ketua halaqah terdaftar hanya baris peserta di kelompoknya;\n" #
    "  pemanggil lain menerima `[]`. Query.\n" #
    "- `rekapPerKelompok(filter : RekapFilter) : async [RekapKelompok]` — rekap per\n" #
    "  kelompok tetap (Halaqah 1–6 dan Musyrifah). **Admin saja**. Query.\n" #
    "- `rekapBulanan(bulan : Nat, tahun : Nat) : async RekapBulanan` — **admin\n" #
    "  saja**. Query.\n" #
    "- `setAmbang(input : AmbangInput) : async Float` — **admin saja**; mengubah\n" #
    "  ambang persentase (default 75.0).\n" #
    "- `getAmbang() : async Float` — Query.\n" #
    "- `eksporRekapPdf(filter : RekapFilter) : async Blob` — rekap per peserta\n" #
    "  sebagai berkas **PDF 1.4** (satu halaman, font Helvetica) berisi baris\n" #
    "  nama, kelompok, total sesi, hadir, persentase, dan penanda di bawah ambang.\n" #
    "  Query.\n" #
    "- `eksporRekapExcel(filter : RekapFilter) : async Blob` — rekap per peserta\n" #
    "  sebagai CSV dipisah titik-koma dengan header, dienkode UTF-8. Query.\n\n" #
    "### Registri anggota (dikelola admin)\n" #
    "- `daftarkanAnggota(principal : Principal, pesertaId : PesertaId) : async ()`\n" #
    "  — **admin saja**; menautkan principal ke satu peserta sehingga ia hanya\n" #
    "  melihat rekap dirinya sendiri.\n" #
    "- `hapusAnggota(principal : Principal) : async ()` — **admin saja**.\n" #
    "- `getPesertaSaya() : async ?PesertaId` — peserta milik pemanggil atau `null`.\n" #
    "  Query.\n\n" #
    "## Dashboard\n\n" #
    "- `dashboard() : async DashboardRingkasan` — kehadiran bulan ini, sesi terdekat\n" #
    "  (tanggal >= sekarang, paling awal), dan halaqah dengan kehadiran terendah\n" #
    "  (hanya kelompok yang memiliki sesi). Query.\n\n" #
    "## OQL — Data Intelligence\n\n" #
    "Empat tabel diekspos melalui OQL: `peserta`, `mapel`, `sesi`, `absensi`.\n" #
    "Semuanya berlevel `controllerOnly` — hanya controller (agen Data Intelligence)\n" #
    "yang membaca seluruh baris; pengguna biasa tidak membaca langsung. Setiap\n" #
    "entitas memanggil `.sample(...)` sehingga skema tetap terisi walau koleksi\n" #
    "kosong. Endpoint `schema()` dan `execute(qJson)` disediakan oleh mixin `Expose`.\n\n" #
    "## Satuan & Encoding\n\n" #
    "- **Timestamp** (`tanggal`, `jendelaMulai`, `jendelaSelesai`, `waktuCatat`)\n" #
    "  adalah nanodetik sejak epoch Unix (`Time.now()`), bertipe `Int`.\n" #
    "- **Persentase** bertipe `Float` dalam rentang 0.0–100.0.\n" #
    "- **Blob** ekspor PDF adalah berkas PDF 1.4 biner; ekspor Excel adalah byte\n" #
    "  UTF-8 dari CSV, bukan berkas terkompresi.\n" #
    "- **KelompokId** adalah teks: `asatidz-h1`..`asatidz-h6` dan `musyrifah`.\n" #
    "- Nilai opsional (`?T`) dikirim sebagai `null` bila tidak ada.\n\n" #
    "## Kesalahan & Batasan\n\n" #
    "- Endpoint yang dijaga memanggil `Runtime.trap` dengan pesan berbahasa\n" #
    "  Indonesia; trap membatalkan seluruh pesan dan sampai ke frontend sebagai\n" #
    "  reject.\n" #
    "- `simpanAbsensi` menolak sesi yang tidak ada (`Sesi tidak ditemukan`).\n" #
    "- `checkIn` menolak token tidak valid dan pemanggilan di luar jendela sesi.\n" #
    "- Tidak ada notifikasi pengingat, audit log, grafik tren, atau impor massal.\n";
  };
};
