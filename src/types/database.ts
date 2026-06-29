// Auto-generated types matching the Supabase schema

export interface Database {
  public: {
    Tables: {
      rekrutmen: { Row: Rekrutmen; Insert: Omit<Rekrutmen, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Rekrutmen, 'id'>> }
      kritis: { Row: Kritis; Insert: Omit<Kritis, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Kritis, 'id'>> }
      b2b_clients: { Row: B2BClient; Insert: Omit<B2BClient, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<B2BClient, 'id'>> }
      b2b_pipeline: { Row: B2BPipeline; Insert: Omit<B2BPipeline, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<B2BPipeline, 'id'>> }
      b2b_progres: { Row: B2BProgres; Insert: Omit<B2BProgres, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<B2BProgres, 'id'>> }
      b2b_checklist: { Row: B2BChecklist; Insert: Omit<B2BChecklist, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<B2BChecklist, 'id'>> }
      batch_offline: { Row: Batch; Insert: Omit<Batch, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Batch, 'id'>> }
      batch_online: { Row: Batch; Insert: Omit<Batch, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Batch, 'id'>> }
      kelas: { Row: Kelas; Insert: Omit<Kelas, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Kelas, 'id'>> }
      lms_fase: { Row: LmsFase; Insert: Omit<LmsFase, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<LmsFase, 'id'>> }
      lms_kendala: { Row: LmsKendala; Insert: Omit<LmsKendala, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<LmsKendala, 'id'>> }
      trainer: { Row: Trainer; Insert: Omit<Trainer, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Trainer, 'id'>> }
      kas: { Row: Kas; Insert: Omit<Kas, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Kas, 'id'>> }
      fin_rekap: { Row: FinRekap; Insert: Omit<FinRekap, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<FinRekap, 'id'>> }
      cashflow: { Row: Cashflow; Insert: Omit<Cashflow, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Cashflow, 'id'>> }
      forecast: { Row: Forecast; Insert: Omit<Forecast, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Forecast, 'id'>> }
      forecast_cost: { Row: ForecastCost; Insert: Omit<ForecastCost, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<ForecastCost, 'id'>> }
      mitigasi: { Row: Mitigasi; Insert: Omit<Mitigasi, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Mitigasi, 'id'>> }
      leads: { Row: Lead; Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Lead, 'id'>> }
      channel_cost: { Row: ChannelCost; Insert: Omit<ChannelCost, 'id' | 'updated_at'>; Update: Partial<Omit<ChannelCost, 'id'>> }
      content_tracking: { Row: ContentTracking; Insert: Omit<ContentTracking, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<ContentTracking, 'id'>> }
      cap_trainer: { Row: CapTrainer; Insert: Omit<CapTrainer, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<CapTrainer, 'id'>> }
      staff_load: { Row: StaffLoad; Insert: Omit<StaffLoad, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<StaffLoad, 'id'>> }
      nps: { Row: NPS; Insert: Omit<NPS, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<NPS, 'id'>> }
      feedback: { Row: Feedback; Insert: Omit<Feedback, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Feedback, 'id'>> }
      settings: { Row: Setting; Insert: Setting; Update: Partial<Setting> }
    }
  }
}

export interface Rekrutmen {
  id: string
  posisi: string
  entitas: string
  kategori: string
  mulai: string | null
  selesai: string | null
  pct: number
  tahap: string
  created_at: string
  updated_at: string
}

export interface Kritis {
  id: string
  posisi: string
  entitas: string
  prioritas: string
  deadline: string | null
  catatan: string
  created_at: string
  updated_at: string
}

export interface B2BClient {
  id: string
  scope: 'internal' | 'external'
  nama: string
  layanan: string
  nilai: number
  pic: string
  status: string
  created_at: string
  updated_at: string
}

export interface B2BPipeline {
  id: string
  scope: 'internal' | 'external'
  nama: string
  layanan: string
  nilai: number
  pic: string
  stage: string
  prob: number
  score: number
  created_at: string
  updated_at: string
}

export interface B2BProgres {
  id: string
  client_id: string
  fase: string
  keterangan: string
  tanggal: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface B2BChecklist {
  id: string
  scope: 'internal' | 'external'
  client_id: string
  task: string
  target_date: string | null
  status: string
  link: string
  created_at: string
  updated_at: string
}

export interface Batch {
  id: string
  nama: string
  tanggal: string | null
  tempat: string
  trainer: string
  peserta: number
  status: string
  created_at: string
  updated_at: string
}

export interface Kelas {
  id: string
  nama: string
  kategori: string
  modul: number
  peserta: number
  progress: number
  status: string
  created_at: string
  updated_at: string
}

export interface LmsFase {
  id: string
  fase: string
  deskripsi: string
  target: string
  progress: number
  status: string
  created_at: string
  updated_at: string
}

export interface LmsKendala {
  id: string
  kendala: string
  prioritas: string
  pic: string
  deadline: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Trainer {
  id: string
  nama: string
  bidang: string
  email: string
  hp: string
  sertifikasi: string
  materi: string
  status: string
  created_at: string
  updated_at: string
}

export interface Kas {
  id: string
  divisi: string
  tgl: string
  ket: string
  jenis: 'masuk' | 'keluar'
  nominal: number
  file_url: string
  created_at: string
  updated_at: string
}

export interface FinRekap {
  id: string
  divisi: string
  masuk: number
  keluar: number
  ket: string
  created_at: string
  updated_at: string
}

export interface Cashflow {
  id: string
  tanggal: string
  tipe: 'Revenue' | 'Fixed' | 'Variable'
  kategori: string
  divisi: string
  nominal: number
  created_at: string
  updated_at: string
}

// Forecasting: one row per divisi per tahun; 12 month columns
export interface Forecast {
  id: string
  divisi: string
  tahun: number
  jan: number; feb: number; mar: number; apr: number
  mei: number; jun: number; jul: number; agu: number
  sep: number; okt: number; nov: number; des: number
  created_at: string
  updated_at: string
}

// Cost matrix: one row per kategori per tahun; 12 month columns
export interface ForecastCost {
  id: string
  kategori: string
  tipe: string
  tahun: number
  jan: number; feb: number; mar: number; apr: number
  mei: number; jun: number; jul: number; agu: number
  sep: number; okt: number; nov: number; des: number
  created_at: string
  updated_at: string
}

export interface Mitigasi {
  id: string
  risiko: string
  dampak: string
  probabilitas: string
  prioritas: string
  pic: string
  deadline: string | null
  tindakan: string
  status: string
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  nama: string
  channel: string
  stage: string
  last_interaction: string | null
  notes: string
  created_at: string
  updated_at: string
}

export interface ChannelCost {
  id: string
  channel: string
  biaya: number
  leads_count: number
  updated_at: string
}

export interface ContentTracking {
  id: string
  judul: string
  platform: string
  stage: string
  views: number
  engagement: number
  leads_gen: number
  status: string
  created_at: string
  updated_at: string
}

export interface CapTrainer {
  id: string
  nama: string
  max_batch: number
  current_batch: number
  status: string
  kpi: string
  created_at: string
  updated_at: string
}

export interface StaffLoad {
  id: string
  nama: string
  jabatan: string
  max_jam: number
  current_jam: number
  status: string
  kpi: string
  created_at: string
  updated_at: string
}

export interface NPS {
  id: string
  klien: string
  skor: number
  tanggal: string
  komentar: string
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  klien: string
  kategori: string
  isi: string
  sentimen: string
  status: string
  created_at: string
  updated_at: string
}

export interface Setting {
  key: string
  value: string
  updated_at: string
}

export type KasDivisi = 'headhunter' | 'b2b-internal' | 'b2b-external' | 'courses' | 'lms'
