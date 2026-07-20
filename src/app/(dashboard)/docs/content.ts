export interface DocField {
  nama: string
  tipe: string
  wajib?: boolean
  keterangan?: string
}

export interface DocModule {
  id: string
  label: string
  ringkasan: string
  tabel: string[]
  langkah: string[]
  field?: { untuk: string; items: DocField[] }[]
  rumus?: string[]
}

export const ARSITEKTUR = {
  ringkasan:
    'NEUverse Dashboard dibangun dengan Next.js 14 (App Router) + TypeScript, di-deploy di Vercel, dan datanya tersimpan di Supabase (PostgreSQL). Setiap modul adalah satu halaman React yang membaca dan menulis data langsung ke Supabase lewat @supabase/supabase-js — tidak ada backend custom terpisah.',
  poin: [
    {
      judul: 'Alur data',
      icon: 'Workflow',
      isi: 'Setiap halaman memanggil supabase.from("nama_tabel").select()/.insert()/.update()/.delete() langsung dari komponen client (\'use client\'). Tidak ada API route perantara — Supabase berperan sebagai backend sekaligus database.',
    },
    {
      judul: 'Struktur folder',
      icon: 'FolderTree',
      isi: 'src/app/ berisi satu folder per modul (routing Next.js App Router). src/components/ui/ berisi komponen bersama (Card, Modal, DataTable, StatCard, Tag, Toast, Confirm) yang dipakai semua halaman. src/components/layout/ berisi Sidebar & Topbar. src/lib/utils.ts menyimpan konstanta pilihan dropdown dan rumus bersama (scoreLead, alertLevel, npsCat, dst). src/types/database.ts adalah definisi TypeScript yang mencerminkan skema Supabase.',
    },
    {
      judul: 'Keamanan & akses',
      icon: 'Lock',
      isi: 'Dashboard ini dilindungi satu gerbang login bersama (email & password satu akun tim, bukan akun per-orang) — dicek di server lewat Next.js Middleware, tersimpan sebagai cookie httpOnly, kredensialnya tidak pernah ikut ke kode yang dikirim ke browser. Ini tetap BUKAN keamanan tingkat enterprise: begitu berhasil login, Row Level Security di Supabase masih berpolicy "allow_all" (siapa pun yang tahu URL Supabase & anon key bisa akses API langsung tanpa lewat login). Jangan bagikan kredensial login ke luar tim.',
    },
    {
      judul: 'Dokumen & lampiran',
      icon: 'Link2',
      isi: 'Dashboard tidak menyimpan file yang di-upload langsung (tidak pakai Supabase Storage) — ini sengaja untuk menghemat kuota storage. Semua lampiran/bukti harus berupa link Google Drive, Docs, Sheets, Slides, atau Forms yang sudah diunggah ke Google Workspace terlebih dahulu.',
    },
  ],
}

export const KONVENSI = [
  {
    judul: 'Link dokumen wajib Google Drive/Workspace',
    icon: 'Link2',
    isi: 'Setiap field yang meminta "link bukti" atau "link dokumen" (misalnya Bukti Transaksi di Buku Kas) HARUS diawali https://drive.google.com/, https://docs.google.com/, https://sheets.google.com/, https://slides.google.com/, atau https://forms.google.com/. Link lain akan ditolak — baik oleh form maupun oleh database itu sendiri. Upload file ke Google Drive dulu, set akses "Anyone with the link", baru salin link-nya ke dashboard.',
  },
  {
    judul: 'Format tanggal',
    icon: 'Calendar',
    isi: 'Semua input tanggal memakai date picker bawaan browser (format tampil mengikuti pengaturan regional perangkat, disimpan sebagai format standar YYYY-MM-DD).',
  },
  {
    judul: 'Format Rupiah',
    icon: 'Wallet',
    isi: 'Semua nominal uang diketik sebagai angka biasa tanpa titik/koma (misal 5000000 untuk Rp 5.000.000) — dashboard yang otomatis memformat tampilannya.',
  },
  {
    judul: 'Penamaan Divisi',
    icon: 'Building2',
    isi: 'Divisi yang dipakai konsisten di seluruh modul: Headhunter, B2B Internal, B2B Eksternal, Courses, LMS. Gunakan ejaan ini persis di field manapun yang meminta nama divisi supaya data bisa direkap dengan benar di halaman Finance/Kas.',
  },
]

export const MODULES: DocModule[] = [
  {
    id: 'dashboard',
    label: 'Halaman Depan',
    ringkasan: 'Ringkasan kondisi bisnis secara keseluruhan — KPI utama, Pusat Tindakan (Action Center), dan 5 visualisasi chart. Semuanya bisa difilter per Tahun, Bulan, atau rentang tanggal Kustom lewat kontrol di kanan atas halaman.',
    tabel: ['b2b_clients', 'rekrutmen', 'batch_offline', 'batch_online', 'leads', 'forecast', 'cashflow', 'b2b_checklist', 'kritis', 'mitigasi', 'settings'],
    langkah: [
      'Pilih mode filter di kanan atas: Tahun (agregat 1 tahun penuh), Bulan (1 bulan spesifik), atau Kustom (rentang tanggal bebas dengan 2 date picker).',
      'Semua KPI, Pusat Tindakan, dan chart di halaman ini otomatis mengikuti rentang yang dipilih — kecuali "Total Klien Aktif" yang selalu menunjukkan status saat ini, karena tabel Klien memang tidak punya field tanggal untuk difilter.',
      'Klik baris apa pun di "Pusat Tindakan" untuk langsung menuju modul terkait yang perlu ditindaklanjuti (Marketing, B2B, Headhunter, atau Mitigasi Resiko).',
    ],
    rumus: [
      'Model perhitungan: "kondisi per akhir rentang yang dipilih" — metrik akumulasi (Kas Saat Ini, Posisi Terpenuhi, Klien) memakai semua data sampai akhir rentang; metrik per-periode (Revenue, Net Burn, Target/Realisasi) memakai data di dalam rentang itu saja.',
      'Runway = Kas Saat Ini (akumulasi s.d. akhir rentang) ÷ rata-rata Net Burn 3 bulan kalender terakhir yang berakhir di bulan akhir rentang.',
      'Hot Leads Overdue, Checklist Overdue, dan Posisi Kritis overdue dievaluasi relatif ke akhir rentang (atau hari ini kalau rentang mencakup masa depan).',
      'Chart: Line = tren Revenue vs Pengeluaran 6 bulan terakhir. Polar Area = distribusi Leads per Channel. Radar = % Capaian Target per Divisi. Bar horizontal = distribusi Status Batch Training. Bar vertikal = Target vs Realisasi Revenue per Divisi.',
    ],
  },
  {
    id: 'headhunter',
    label: 'Headhunter',
    ringkasan: 'Mengelola progres rekrutmen posisi dan daftar posisi kritis yang butuh perhatian segera.',
    tabel: ['rekrutmen', 'kritis'],
    langkah: [
      'Tab "Progres Rekrutmen": klik + Tambah untuk mencatat lowongan baru — isi Posisi, Entitas, Kategori, Tahap, tanggal mulai/selesai, dan % Terpenuhi.',
      'Tab "Posisi Kritis": untuk posisi yang mendesak (deadline ketat), tambahkan di sini dengan Prioritas dan Deadline — baris akan otomatis ditandai merah/kuning kalau deadline mendekat atau lewat.',
      'Dashboard & Pemenuhan Entitas otomatis terhitung dari data di dua tab tersebut — tidak perlu diisi manual.',
    ],
    field: [
      { untuk: 'Rekrutmen', items: [
        { nama: 'Posisi', tipe: 'teks', wajib: true },
        { nama: 'Entitas', tipe: 'teks', wajib: true },
        { nama: 'Kategori', tipe: 'pilihan', keterangan: 'Staff & Admin / Supervisor / Head / Top' },
        { nama: 'Tahap', tipe: 'pilihan', keterangan: 'Screening / Interview / Offering / Selesai' },
        { nama: 'Tgl Mulai & Selesai', tipe: 'tanggal' },
        { nama: 'Karyawan Hired', tipe: 'teks' },
        { nama: 'Media/Job Portal', tipe: 'teks' },
        { nama: 'Lokasi Penempatan', tipe: 'teks' },
        { nama: 'Deadline Posisi', tipe: 'tanggal' },
        { nama: 'File OL (link)', tipe: 'link' },
        { nama: '% Terpenuhi', tipe: 'angka' },
      ]},
      { untuk: 'Posisi Kritis', items: [
        { nama: 'Posisi & Entitas', tipe: 'teks', wajib: true },
        { nama: 'Prioritas', tipe: 'pilihan', keterangan: 'Urgent / Tinggi / Sedang' },
        { nama: 'Deadline', tipe: 'tanggal' },
        { nama: 'Catatan', tipe: 'teks' },
      ]},
    ],
  },
  {
    id: 'b2b-internal',
    label: 'B2B Internal',
    ringkasan: 'Mengelola klien, pipeline penjualan, checklist milestone, dan progres implementasi untuk proyek B2B internal.',
    tabel: ['b2b_clients (scope=internal)', 'b2b_pipeline (scope=internal)', 'b2b_checklist (scope=internal)', 'b2b_progres'],
    langkah: [
      'Tab "Client & Pipeline": tambah Client aktif dulu (Nama, Layanan, Nilai, PIC, Status), lalu tambah baris Pipeline untuk prospek yang masih dinegosiasikan.',
      'Tab "Checklist & Dokumen": untuk tiap client, tambah milestone/tugas dengan Target Date dan Status — progress % otomatis dihitung dari bobot status (Selesai Acc=100%, Review Internal=75%, Proses Kerja=50%).',
      'Tiap Client Aktif otomatis mendapat tab tersendiri "{Nama Client} — Progres" untuk mencatat fase implementasi end-to-end (Kickoff, Delivery, dst).',
    ],
    field: [
      { untuk: 'Client', items: [
        { nama: 'Nama Client', tipe: 'teks', wajib: true },
        { nama: 'Jenis Layanan', tipe: 'teks' },
        { nama: 'Nilai (Rp)', tipe: 'angka' },
        { nama: 'PIC', tipe: 'teks' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Aktif / Hold / Selesai' },
      ]},
      { untuk: 'Pipeline', items: [
        { nama: 'Nama Prospek & Layanan', tipe: 'teks' },
        { nama: 'Est. Nilai', tipe: 'angka' },
        { nama: 'Stage', tipe: 'pilihan', keterangan: 'Prospek / Proposal / Negosiasi / Konfirmasi' },
        { nama: 'Prob % & Lead Score', tipe: 'angka' },
      ]},
      { untuk: 'Checklist/Milestone', items: [
        { nama: 'Client', tipe: 'pilihan dari daftar client', wajib: true },
        { nama: 'Tugas/Milestone', tipe: 'teks' },
        { nama: 'Target Date', tipe: 'tanggal' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Belum Mulai / Proses Kerja / Review Internal / Selesai Acc' },
        { nama: 'Link Dokumen', tipe: 'link Google Drive/Workspace' },
      ]},
    ],
    rumus: ['Progress checklist per client = rata-rata bobot status semua milestone client tersebut.', 'Ratio Closed = jumlah pipeline ÷ jumlah client aktif.'],
  },
  {
    id: 'b2b-external',
    label: 'B2B Eksternal',
    ringkasan: 'Sama persis dengan B2B Internal, tapi untuk klien eksternal (scope=external) — data dan perhitungannya sepenuhnya terpisah dari B2B Internal.',
    tabel: ['b2b_clients (scope=external)', 'b2b_pipeline (scope=external)', 'b2b_checklist (scope=external)', 'b2b_progres'],
    langkah: ['Cara pengisian identik dengan modul B2B Internal — lihat panduan di modul tersebut.'],
  },
  {
    id: 'courses',
    label: 'Courses',
    ringkasan: 'Mengelola jadwal batch training offline & online, serta progres kelas/modul yang sedang berjalan.',
    tabel: ['batch_offline', 'batch_online', 'kelas'],
    langkah: [
      'Tab "Offline Batch"/"Online Batch": tambah jadwal training dengan Nama Batch, Tanggal, Tempat/Platform, Trainer, Peserta, dan Status.',
      'Tab "Kelas Aktif & Modul": tambah kelas dengan Progress % — progress bar akan tampil otomatis.',
    ],
    field: [
      { untuk: 'Batch (Offline/Online)', items: [
        { nama: 'Nama Batch', tipe: 'teks', wajib: true },
        { nama: 'Tanggal', tipe: 'tanggal' },
        { nama: 'Tempat/Platform', tipe: 'teks' },
        { nama: 'Trainer', tipe: 'teks' },
        { nama: 'Peserta', tipe: 'angka' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Pipeline / Akan Datang / Berjalan / Selesai' },
      ]},
      { untuk: 'Kelas', items: [
        { nama: 'Nama Kelas & Kategori', tipe: 'teks' },
        { nama: 'Modul & Peserta', tipe: 'angka' },
        { nama: 'Progress %', tipe: 'angka' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Baru / Berjalan / Aktif / Selesai' },
      ]},
    ],
  },
  {
    id: 'lms',
    label: 'LMS',
    ringkasan: 'Melacak progres pengembangan fase LMS, kendala teknis yang perlu diselesaikan, dan roster trainer.',
    tabel: ['lms_fase', 'lms_kendala', 'trainer'],
    langkah: [
      'Card "Progress LMS per Fase": tambah fase pengembangan dengan target dan Progress % nya.',
      'Card "Kendala & Prioritas": catat kendala teknis/operasional dengan Prioritas, PIC, dan Deadline penyelesaian.',
      'Card "List Trainer": kelola data trainer LMS (kontak, sertifikasi, materi yang dikuasai).',
    ],
    field: [
      { untuk: 'Fase LMS', items: [
        { nama: 'Fase & Deskripsi', tipe: 'teks' },
        { nama: 'Target', tipe: 'teks' },
        { nama: 'Progress %', tipe: 'angka' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Belum Mulai / Berjalan / Menunggu / Selesai' },
      ]},
      { untuk: 'Kendala', items: [
        { nama: 'Kendala', tipe: 'teks', wajib: true },
        { nama: 'Prioritas', tipe: 'pilihan', keterangan: 'Tinggi / Sedang / Rendah' },
        { nama: 'PIC & Deadline', tipe: 'teks/tanggal' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Antre / Proses / Selesai' },
      ]},
      { untuk: 'Trainer', items: [
        { nama: 'Nama, Bidang, Email, No. HP', tipe: 'teks' },
        { nama: 'Sertifikasi & Materi', tipe: 'teks' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Aktif / Baru / Nonaktif' },
      ]},
    ],
  },
  {
    id: 'kas',
    label: 'Buku Kas Harian',
    ringkasan: 'Mencatat transaksi kas masuk/keluar harian per divisi — sumber data utama untuk perhitungan kesehatan kas di modul Finance.',
    tabel: ['kas'],
    langkah: [
      'Pilih tab divisi (Headhunter/B2B Internal/B2B Eksternal/Courses/LMS), klik + Tambah Transaksi.',
      'Isi Tanggal, Keterangan, Jenis (Pemasukan/Pengeluaran), dan Nominal.',
      'Kalau ada bukti transaksi, upload dulu ke Google Drive lalu tempel link-nya di "Link Bukti" — link selain Google Drive/Docs/Sheets/Slides/Forms akan ditolak (lihat Konvensi & Format).',
    ],
    field: [
      { untuk: 'Transaksi Kas', items: [
        { nama: 'Tanggal', tipe: 'tanggal', wajib: true },
        { nama: 'Keterangan', tipe: 'teks', wajib: true },
        { nama: 'Jenis', tipe: 'pilihan', keterangan: 'Pemasukan / Pengeluaran' },
        { nama: 'Nominal (Rp)', tipe: 'angka', wajib: true },
        { nama: 'Link Bukti', tipe: 'link Google Drive/Workspace (opsional)' },
      ]},
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    ringkasan: 'Ringkasan kesehatan kas (runway, burn rate) dan rekap finansial per divisi — sebagian besar datanya otomatis dari Buku Kas.',
    tabel: ['cashflow', 'fin_rekap', 'settings'],
    langkah: [
      'Set "Saldo Awal Kas" sekali di awal (input langsung di halaman, tersimpan ke settings).',
      'Tab "Kesehatan Kas": tambah transaksi Revenue/Fixed/Variable Cost lewat modal — dari sini Runway & Net Burn dihitung otomatis.',
      'Tab "Konsolidasi": tambah rekap manual per divisi (Pemasukan/Pengeluaran) kalau perlu ringkasan di luar transaksi harian.',
    ],
    field: [
      { untuk: 'Transaksi Cashflow', items: [
        { nama: 'Tanggal', tipe: 'tanggal', wajib: true },
        { nama: 'Tipe', tipe: 'pilihan', keterangan: 'Revenue / Fixed / Variable', wajib: true },
        { nama: 'Kategori', tipe: 'teks', keterangan: 'mis. Gaji, Ads' },
        { nama: 'Divisi', tipe: 'pilihan (opsional)' },
        { nama: 'Nominal (Rp)', tipe: 'angka' },
      ]},
      { untuk: 'Rekap Finansial', items: [
        { nama: 'Divisi/Sumber', tipe: 'teks' },
        { nama: 'Pemasukan & Pengeluaran', tipe: 'angka' },
        { nama: 'Keterangan', tipe: 'teks' },
      ]},
    ],
    rumus: [
      'Kas Saat Ini = Saldo Awal + total Revenue − total Fixed & Variable Cost.',
      'Net Burn/Bulan = rata-rata (Fixed+Variable−Revenue) 3 bulan terakhir; kalau ≤0 ditampilkan sebagai Surplus.',
      'Runway = Kas Saat Ini ÷ Net Burn per bulan (ditampilkan "∞" kalau sedang surplus). Peringatan merah muncul kalau runway < 3 bulan.',
    ],
  },
  {
    id: 'forecasting',
    label: 'Forecasting',
    ringkasan: 'Target pendapatan dan matriks biaya 12 bulan per divisi/tahun, untuk membandingkan proyeksi vs realisasi.',
    tabel: ['forecast', 'forecast_cost'],
    langkah: [
      'Pilih tahun di dropdown atas halaman.',
      'Tab "Target Pendapatan": tambah target per Divisi, isi ke-12 kolom bulan (Januari–Desember) sekaligus.',
      'Tab "Cost Matrix": tambah baris biaya per Kategori dengan Tipe (Fixed/Variable), isi ke-12 kolom bulan.',
    ],
    field: [
      { untuk: 'Target Pendapatan', items: [
        { nama: 'Divisi', tipe: 'pilihan', wajib: true },
        { nama: 'Jan s/d Des', tipe: 'angka (12 kolom)' },
      ]},
      { untuk: 'Cost Matrix', items: [
        { nama: 'Kategori', tipe: 'teks' },
        { nama: 'Tipe', tipe: 'pilihan', keterangan: 'Fixed / Variable' },
        { nama: 'Jan s/d Des', tipe: 'angka (12 kolom)' },
      ]},
    ],
    rumus: ['Total per baris = jumlah 12 bulan.', 'Projected Net (tahunan) = Total Revenue − Total Cost.'],
  },
  {
    id: 'mitigasi',
    label: 'Mitigasi Resiko',
    ringkasan: 'Register risiko operasional/bisnis beserta rencana mitigasi dan status penanganannya.',
    tabel: ['mitigasi'],
    langkah: ['Klik + Tambah Risiko, isi Risiko, Dampak, Probabilitas, Prioritas, PIC, Deadline, dan Tindakan Mitigasi.', 'Update Status seiring progres penanganan (Terbuka → Mitigasi → Solved).'],
    field: [
      { untuk: 'Risiko', items: [
        { nama: 'Risiko & Dampak', tipe: 'teks', wajib: true },
        { nama: 'Probabilitas', tipe: 'pilihan', keterangan: 'Rendah / Sedang / Tinggi' },
        { nama: 'Prioritas', tipe: 'pilihan', keterangan: 'Urgent / Tinggi / Sedang' },
        { nama: 'PIC & Deadline', tipe: 'teks/tanggal' },
        { nama: 'Tindakan Mitigasi', tipe: 'teks' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Terbuka / Mitigasi / Solved' },
      ]},
    ],
    rumus: ['Baris ditandai merah kalau deadline terlewati & belum Solved; kuning kalau prioritas Tinggi & belum Solved.'],
  },
  {
    id: 'marketing',
    label: 'Marketing Funnel',
    ringkasan: 'Lead scoring otomatis, funnel konversi TOFU–BOFU, dan tracking performa konten per platform.',
    tabel: ['leads', 'channel_cost', 'content_tracking'],
    langkah: [
      'Tab "Leads & Scoring": tambah lead baru dengan Channel, Stage, dan tanggal interaksi terakhir — skor & suhu (Hot/Warm/Cold) terhitung otomatis.',
      'Tab "Funnel & Konversi": atur biaya per channel untuk melihat Cost Per Lead (CPL).',
      'Tab "Konten": catat setiap konten yang dibuat dengan Platform, Stage funnel, dan performa (Views/Engagement/Leads Gen).',
    ],
    field: [
      { untuk: 'Lead', items: [
        { nama: 'Nama Lead', tipe: 'teks', wajib: true },
        { nama: 'Channel', tipe: 'pilihan', keterangan: 'LinkedIn / Instagram / Referral / Komunitas / Lainnya' },
        { nama: 'Stage', tipe: 'pilihan', keterangan: 'Lead / MQL / SQL / Deal / Lost' },
        { nama: 'Last Interaction', tipe: 'tanggal' },
        { nama: 'Notes', tipe: 'teks' },
      ]},
      { untuk: 'Biaya Channel', items: [
        { nama: 'Channel', tipe: 'pilihan' },
        { nama: 'Biaya (Rp) & Jumlah Leads', tipe: 'angka' },
      ]},
      { untuk: 'Konten', items: [
        { nama: 'Judul Konten', tipe: 'teks' },
        { nama: 'Platform', tipe: 'pilihan', keterangan: 'LinkedIn / Instagram / TikTok / YouTube / Facebook Ads / Referral' },
        { nama: 'Stage', tipe: 'pilihan', keterangan: 'TOFU / MOFU / BOFU' },
        { nama: 'Views, Engagement, Leads Gen', tipe: 'angka' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Ideasi / Produksi Naskah / Editing / Scheduled / Sudah Rilis' },
      ]},
    ],
    rumus: [
      'Skor Lead: +30/+20/+10 dari channel (Referral/Komunitas tertinggi), +25/+15/−10 dari kebaruan interaksi, +10/+20/+30 dari Stage (MQL/SQL/Deal).',
      'Suhu: Hot ≥70, Warm ≥40, sisanya Cold.',
      'CPL = Biaya Channel ÷ Jumlah Leads.',
      'Konversi antar-stage funnel = jumlah lead stage sekarang ÷ jumlah lead stage sebelumnya × 100%.',
    ],
  },
  {
    id: 'resource',
    label: 'Resource Utilization',
    ringkasan: 'Memantau beban kerja trainer dan staff supaya tidak ada yang overload atau menganggur.',
    tabel: ['cap_trainer', 'staff_load'],
    langkah: [
      'Tab "Trainer Capacity": isi Max Batch dan Batch Aktif Saat Ini per trainer.',
      'Tab "Staff Workload": isi Max Jam/Bulan dan Jam Aktif Saat Ini per staff.',
      'Utilisasi % dan status overload terhitung otomatis dari dua angka tersebut.',
    ],
    field: [
      { untuk: 'Trainer Capacity', items: [
        { nama: 'Nama Trainer', tipe: 'teks', wajib: true },
        { nama: 'Max Batch & Batch Aktif', tipe: 'angka' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Sehat / Hampir Penuh / Overload (dipilih manual)' },
        { nama: 'KPI/Target', tipe: 'teks', keterangan: 'mis. 4 batch/bulan' },
      ]},
      { untuk: 'Staff Workload', items: [
        { nama: 'Nama & Jabatan', tipe: 'teks' },
        { nama: 'Max Jam & Jam Aktif', tipe: 'angka' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Ringan / Normal / Berat (dipilih manual)' },
        { nama: 'KPI/Target', tipe: 'teks' },
      ]},
    ],
    rumus: ['Utilisasi % = Aktif ÷ Max × 100. Ditandai merah kalau ≥100%, kuning kalau ≥80%.'],
  },
  {
    id: 'client-success',
    label: 'Client Success',
    ringkasan: 'Skor NPS klien dan log feedback untuk memantau kepuasan pelanggan.',
    tabel: ['nps', 'feedback'],
    langkah: [
      'Tab "NPS Score": tambah skor 0–10 dari tiap klien — gauge NPS keseluruhan terhitung otomatis.',
      'Tab "Feedback Log": catat masukan klien dengan Sentimen dan Status tindak lanjut.',
    ],
    field: [
      { untuk: 'NPS', items: [
        { nama: 'Nama Klien', tipe: 'teks', wajib: true },
        { nama: 'Skor NPS', tipe: 'angka 0–10' },
        { nama: 'Tanggal & Komentar', tipe: 'tanggal/teks' },
      ]},
      { untuk: 'Feedback', items: [
        { nama: 'Klien & Kategori', tipe: 'teks', keterangan: 'mis. Kelas, Trainer, Admin' },
        { nama: 'Isi Feedback', tipe: 'teks' },
        { nama: 'Sentimen', tipe: 'pilihan', keterangan: 'Positif / Netral / Negatif' },
        { nama: 'Status', tipe: 'pilihan', keterangan: 'Baru / Ditindaklanjuti / Selesai' },
      ]},
    ],
    rumus: ['NPS Score = (Promoter[skor≥9] − Detractor[skor≤6]) ÷ Total × 100.'],
  },
]
