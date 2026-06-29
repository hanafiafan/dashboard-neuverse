# NEUverse Dashboard — Setup Guide

Panduan lengkap deploy ke Supabase + Vercel.

---

## Prasyarat

- Node.js 18+
- Akun [Supabase](https://supabase.com) (gratis)
- Akun [Vercel](https://vercel.com) (gratis)
- Git

---

## Langkah 1 — Buat Project Supabase

1. Login ke [supabase.com](https://supabase.com) → **New project**
2. Pilih organisasi, beri nama project (mis: `neuverse-dashboard`), set password database, pilih region terdekat
3. Tunggu ~2 menit hingga project aktif

---

## Langkah 2 — Jalankan SQL Schema

1. Di Supabase dashboard, buka **SQL Editor** → **New query**
2. Copy isi file `supabase-schema.sql` (ada di folder project ini)
3. Paste ke editor → **Run** (Ctrl+Enter)
4. Pastikan tidak ada error merah. Semua 26 tabel + RLS + trigger akan terbuat

> **Verifikasi:** Buka **Table Editor** → pastikan tabel `rekrutmen`, `leads`, `cashflow`, `settings`, dst. muncul

---

## Langkah 3 — Ambil Supabase Keys

1. Di Supabase dashboard → **Settings** → **API**
2. Catat dua nilai ini:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon (public) key** → string panjang `eyJ...`

---

## Langkah 4 — Setup Project Lokal

```bash
# Clone / buka folder project
cd neuverse-dashboard

# Install dependencies
npm install

# Buat file environment
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJXXXXXXXX
```
Ganti dengan nilai dari Langkah 3.

---

## Langkah 5 — Jalankan Lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Dashboard siap.

> **Test:** Coba tambah data di Headhunter → pastikan data tersimpan di Supabase Table Editor

---

## Langkah 6 — Deploy ke Vercel

### Opsi A: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel

# Ikuti prompt:
# - Set up and deploy? Y
# - Which scope? (pilih akun kamu)
# - Link to existing project? N
# - Project name: neuverse-dashboard
# - Directory: ./
# - Override settings? N
```

### Opsi B: Via GitHub (Recommended)

1. Push project ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/AKUN/REPO.git
   git push -u origin main
   ```
2. Login ke [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Pilih repo → **Deploy**

---

## Langkah 7 — Set Environment Variables di Vercel

1. Di Vercel dashboard → project kamu → **Settings** → **Environment Variables**
2. Tambahkan dua variable:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJXXXX...` |

3. Klik **Save** → **Redeploy** (Deployments → klik titik tiga → Redeploy)

---

## Langkah 8 — Verifikasi Production

Buka URL Vercel kamu (mis. `https://neuverse-dashboard.vercel.app`). Semua 13 modul harus bisa diakses dan menyimpan data ke Supabase.

---

## Struktur Project

```
neuverse-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home / Beranda
│   │   ├── headhunter/
│   │   ├── b2b-internal/
│   │   ├── b2b-external/
│   │   ├── courses/
│   │   ├── lms/
│   │   ├── kas/
│   │   ├── finance/
│   │   ├── forecasting/
│   │   ├── mitigasi/
│   │   ├── marketing/
│   │   ├── resource/
│   │   └── client-success/
│   ├── components/
│   │   ├── layout/             # Sidebar, Topbar
│   │   ├── modules/            # HomeClient, B2BPage (shared)
│   │   └── ui/                 # StatCard, Card, Modal, DataTable, Tag, Toast
│   ├── lib/
│   │   ├── supabase/client.ts  # Supabase client
│   │   └── utils.ts            # formatRp, scoreLead, dll.
│   └── types/
│       └── database.ts         # TypeScript types untuk semua 26 tabel
├── supabase-schema.sql         # SQL migration lengkap
├── .env.example
└── package.json
```

---

## Modul yang Tersedia

| Route | Modul |
|-------|-------|
| `/` | Beranda (KPI + Action Center) |
| `/headhunter` | Rekrutmen & Pemenuhan Posisi |
| `/b2b-internal` | B2B Internal (Pipeline & Checklist) |
| `/b2b-external` | B2B External (Pipeline & Checklist) |
| `/courses` | Manajemen Batch & Kelas |
| `/lms` | LMS Fase, Kendala, Trainer |
| `/kas` | Buku Kas Harian per Divisi |
| `/finance` | Kesehatan Kas, Burn Rate, Runway |
| `/forecasting` | Target Revenue + Cost Matrix 12 Bulan |
| `/mitigasi` | Register Risiko & Mitigasi |
| `/marketing` | Lead Scoring, Funnel, Content Tracking |
| `/resource` | Trainer Capacity & Staff Workload |
| `/client-success` | NPS Score & Feedback Log |

---

## Tips & Troubleshooting

**Error: `supabaseUrl is required`**
→ Pastikan `.env.local` ada dan diisi dengan benar. Restart `npm run dev`.

**Data tidak tersimpan**
→ Cek Supabase Table Editor apakah RLS sudah aktif dengan policy `allow_all`. Jalankan ulang SQL schema jika perlu.

**Build error di Vercel**
→ Pastikan Environment Variables sudah diset di Vercel Settings sebelum deploy.

**Tampilan rusak / CSS tidak muncul**
→ Pastikan `tailwind.config.js` dan `globals.css` ada dan tidak dimodifikasi.

---

## Kustomisasi Cepat

- **Warna brand:** Edit `src/app/globals.css` → variabel `--primary`, `--accent`, `--accent2`, `--gold`
- **Nama divisi:** Edit `DIVISI` di `src/lib/utils.ts`
- **Lead scoring formula:** Edit fungsi `scoreLead()` di `src/lib/utils.ts`
- **Saldo awal kas:** Set via UI di modul Finance → input "Saldo Awal Kas"
