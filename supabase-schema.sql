-- ============================================================
-- NEUverse Dashboard — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- HEADHUNTER MODULE
-- ============================================================
create table if not exists rekrutmen (
  id uuid primary key default uuid_generate_v4(),
  posisi text not null default '',
  entitas text not null default '',
  kategori text not null default 'Staff & Admin',
  mulai date,
  selesai date,
  pct numeric(5,2) default 0,
  tahap text not null default 'Screening',
  -- New fields:
  catatan text default '',
  file_ol text default '',
  karyawan text default '',
  media text default '',
  deadline date,
  lokasi text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists kritis (
  id uuid primary key default uuid_generate_v4(),
  posisi text not null default '',
  entitas text not null default '',
  prioritas text not null default 'Sedang',
  deadline date,
  catatan text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- B2B MODULE (internal & external shared table with scope)
-- ============================================================
create table if not exists b2b_clients (
  id uuid primary key default uuid_generate_v4(),
  scope text not null check (scope in ('internal', 'external')),
  nama text not null default '',
  layanan text default '',
  nilai numeric(15,2) default 0,
  pic text default '',
  status text not null default 'Aktif',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists b2b_pipeline (
  id uuid primary key default uuid_generate_v4(),
  scope text not null check (scope in ('internal', 'external')),
  nama text not null default '',
  layanan text default '',
  nilai numeric(15,2) default 0,
  pic text default '',
  stage text not null default 'Prospek',
  prob numeric(5,2) default 0,
  score numeric(5,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists b2b_progres (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references b2b_clients(id) on delete cascade,
  fase text not null default '',
  keterangan text default '',
  tanggal date,
  status text not null default 'Belum',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists b2b_checklist (
  id uuid primary key default uuid_generate_v4(),
  scope text not null check (scope in ('internal', 'external')),
  client_id uuid references b2b_clients(id) on delete cascade,
  task text not null default '',
  target_date date,
  status text not null default 'Belum Mulai',
  link text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- COURSES MODULE
-- ============================================================
create table if not exists batch_offline (
  id uuid primary key default uuid_generate_v4(),
  nama text not null default '',
  tanggal date,
  tempat text default '',
  trainer text default '',
  peserta integer default 0,
  status text not null default 'Pipeline',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists batch_online (
  id uuid primary key default uuid_generate_v4(),
  nama text not null default '',
  tanggal date,
  tempat text default '',
  trainer text default '',
  peserta integer default 0,
  status text not null default 'Pipeline',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists kelas (
  id uuid primary key default uuid_generate_v4(),
  nama text not null default '',
  kategori text default '',
  modul integer default 0,
  peserta integer default 0,
  progress numeric(5,2) default 0,
  status text not null default 'Baru',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- LMS MODULE
-- ============================================================
create table if not exists lms_fase (
  id uuid primary key default uuid_generate_v4(),
  fase text not null default '',
  deskripsi text default '',
  target text default '',
  progress numeric(5,2) default 0,
  status text not null default 'Belum Mulai',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lms_kendala (
  id uuid primary key default uuid_generate_v4(),
  kendala text not null default '',
  prioritas text not null default 'Sedang',
  pic text default '',
  deadline date,
  status text not null default 'Antre',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists trainer (
  id uuid primary key default uuid_generate_v4(),
  nama text not null default '',
  bidang text default '',
  email text default '',
  hp text default '',
  sertifikasi text default '',
  materi text default '',
  status text not null default 'Aktif',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- KAS HARIAN (Daily Cash Book per division)
-- ============================================================
create table if not exists kas (
  id uuid primary key default uuid_generate_v4(),
  divisi text not null check (divisi in ('headhunter','b2b-internal','b2b-external','courses','lms')),
  tgl date not null default current_date,
  ket text not null default '',
  jenis text not null check (jenis in ('masuk','keluar')),
  nominal numeric(15,2) not null default 0,
  -- Bukti transaksi hanya boleh link Google Drive/Workspace, bukan file upload (hemat Supabase Storage)
  file_url text default '' check (file_url = '' or file_url ~ '^https://(drive|docs|sheets|slides|forms)\.google\.com/'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- FINANCE MODULE
-- ============================================================
create table if not exists fin_rekap (
  id uuid primary key default uuid_generate_v4(),
  divisi text not null default '',
  masuk numeric(15,2) default 0,
  keluar numeric(15,2) default 0,
  ket text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cashflow (
  id uuid primary key default uuid_generate_v4(),
  tanggal date not null default current_date,
  tipe text not null check (tipe in ('Revenue','Fixed','Variable')),
  kategori text default '',
  divisi text default '',
  nominal numeric(15,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- FORECASTING MODULE
-- ============================================================
create table if not exists forecast (
  id uuid primary key default uuid_generate_v4(),
  divisi text not null default 'Headhunter',
  tahun integer not null default 2026,
  jan numeric(15,2) default 0,
  feb numeric(15,2) default 0,
  mar numeric(15,2) default 0,
  apr numeric(15,2) default 0,
  mei numeric(15,2) default 0,
  jun numeric(15,2) default 0,
  jul numeric(15,2) default 0,
  agu numeric(15,2) default 0,
  sep numeric(15,2) default 0,
  okt numeric(15,2) default 0,
  nov numeric(15,2) default 0,
  des numeric(15,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists forecast_cost (
  id uuid primary key default uuid_generate_v4(),
  kategori text not null default '',
  tipe text not null default 'Fixed',
  tahun integer not null default 2026,
  jan numeric(15,2) default 0,
  feb numeric(15,2) default 0,
  mar numeric(15,2) default 0,
  apr numeric(15,2) default 0,
  mei numeric(15,2) default 0,
  jun numeric(15,2) default 0,
  jul numeric(15,2) default 0,
  agu numeric(15,2) default 0,
  sep numeric(15,2) default 0,
  okt numeric(15,2) default 0,
  nov numeric(15,2) default 0,
  des numeric(15,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MITIGASI RESIKO
-- ============================================================
create table if not exists mitigasi (
  id uuid primary key default uuid_generate_v4(),
  risiko text not null default '',
  dampak text default '',
  probabilitas text not null default 'Rendah',
  prioritas text not null default 'Sedang',
  pic text default '',
  deadline date,
  tindakan text default '',
  status text not null default 'Terbuka',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MARKETING MODULE
-- ============================================================
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  nama text not null default '',
  channel text not null default 'LinkedIn',
  stage text not null default 'Lead',
  last_interaction date,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists channel_cost (
  id uuid primary key default uuid_generate_v4(),
  channel text unique not null,
  biaya numeric(15,2) default 0,
  leads_count integer default 0,
  updated_at timestamptz default now()
);

-- Insert default channel costs
insert into channel_cost (channel, biaya) values
  ('LinkedIn', 0),
  ('Instagram', 0),
  ('Referral', 0),
  ('Komunitas', 0),
  ('Lainnya', 0)
on conflict (channel) do nothing;

create table if not exists content_tracking (
  id uuid primary key default uuid_generate_v4(),
  judul text not null default '',
  platform text not null default 'LinkedIn',
  stage text not null default 'TOFU (Awareness)',
  views integer default 0,
  engagement numeric(6,2) default 0,
  leads_gen integer default 0,
  status text not null default 'Ideasi',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- RESOURCE UTILIZATION
-- ============================================================
create table if not exists cap_trainer (
  id uuid primary key default uuid_generate_v4(),
  nama text not null default '',
  max_batch integer default 0,
  current_batch integer default 0,
  status text not null default 'Sehat',
  kpi text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists staff_load (
  id uuid primary key default uuid_generate_v4(),
  nama text not null default '',
  jabatan text default '',
  max_jam integer default 0,
  current_jam integer default 0,
  status text not null default 'Normal',
  kpi text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CLIENT SUCCESS
-- ============================================================
create table if not exists nps (
  id uuid primary key default uuid_generate_v4(),
  klien text not null default '',
  skor numeric(4,1) not null default 0 check (skor >= 0 and skor <= 10),
  tanggal date,
  komentar text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  klien text not null default '',
  kategori text default '',
  isi text default '',
  sentimen text not null default 'Netral',
  status text not null default 'Baru',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SETTINGS (key-value store for app config)
-- ============================================================
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

insert into settings (key, value) values
  ('saldo_awal', '0'),
  ('filter_divisi', 'all')
on conflict (key) do nothing;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to all tables
do $$
declare
  t text;
begin
  foreach t in array array[
    'rekrutmen','kritis','b2b_clients','b2b_pipeline','b2b_progres','b2b_checklist',
    'batch_offline','batch_online','kelas','lms_fase','lms_kendala','trainer',
    'kas','fin_rekap','cashflow','forecast','forecast_cost','mitigasi',
    'leads','channel_cost','content_tracking','cap_trainer','staff_load','nps','feedback','settings'
  ]
  loop
    execute format(
      'drop trigger if exists trg_%I_updated_at on %I;
       create trigger trg_%I_updated_at before update on %I
       for each row execute function update_updated_at();',
      t, t, t, t
    );
  end loop;
end;
$$;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (public access - no auth)
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'rekrutmen','kritis','b2b_clients','b2b_pipeline','b2b_progres','b2b_checklist',
    'batch_offline','batch_online','kelas','lms_fase','lms_kendala','trainer',
    'kas','fin_rekap','cashflow','forecast','forecast_cost','mitigasi',
    'leads','channel_cost','content_tracking','cap_trainer','staff_load','nps','feedback','settings'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'drop policy if exists "allow_all" on %I;
       create policy "allow_all" on %I for all using (true) with check (true);',
      t, t
    );
  end loop;
end;
$$;

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_rekrutmen_tahap on rekrutmen(tahap);
create index if not exists idx_b2b_clients_scope on b2b_clients(scope);
create index if not exists idx_b2b_clients_status on b2b_clients(status);
create index if not exists idx_b2b_pipeline_scope on b2b_pipeline(scope);
create index if not exists idx_b2b_checklist_client on b2b_checklist(client_id);
create index if not exists idx_kas_divisi on kas(divisi);
create index if not exists idx_cashflow_tanggal on cashflow(tanggal);
create index if not exists idx_leads_stage on leads(stage);
create index if not exists idx_forecast_divisi on forecast(divisi);
create index if not exists idx_mitigasi_status on mitigasi(status);

-- Note: no Supabase Storage bucket. Bukti/lampiran hanya boleh link Google Drive/Workspace
-- (lihat check constraint pada kas.file_url di atas) supaya hemat storage.
