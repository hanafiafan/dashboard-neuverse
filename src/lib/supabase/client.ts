'use client'

export interface DbState {
  sheets: Record<string, any[]>;
  config: Record<string, any>;
}

// Default template data for offline fallback
const FALLBACK_TEMPLATE: DbState = {
  "sheets": {
    "rekrutmen": [
      { "posisi": "Continuous Improvement (CI)", "entitas": "RUN - BYL", "kategori": "Staff & Admin", "mulai": "2026-07-01T07:00:00.000Z", "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "PPIC", "entitas": "RUN - BYL", "kategori": "Staff & Admin", "mulai": "2026-07-01T07:00:00.000Z", "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "HR Manager", "entitas": "RBL - BYL", "kategori": "Head", "mulai": "2026-07-01T07:00:00.000Z", "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "Asmen to Director", "entitas": "MBN - BYL", "kategori": "Supervisor", "mulai": null, "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "Account Manager Marketing", "entitas": "HAN - YGY", "kategori": "Staff & Admin", "mulai": null, "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "Staf CS", "entitas": "HAN - BYL", "kategori": "Staff & Admin", "mulai": null, "selesai": null, "pct": 0, "tahap": "Hold" },
      { "posisi": "Staff Finance", "entitas": "HAN - YGY", "kategori": "Staff & Admin", "mulai": null, "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "Staff Finance", "entitas": "HAN - BYL", "kategori": "Staff & Admin", "mulai": null, "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "Staff Ads", "entitas": "HAN - YGY", "kategori": "Staff & Admin", "mulai": null, "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "Staff Affiliate ", "entitas": "LBP - BYL", "kategori": "Staff & Admin", "mulai": null, "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "Marketing Lead", "entitas": "LBP - BYL", "kategori": "Staff & Admin", "mulai": null, "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "Marketing Optimationz", "entitas": "LBP - BYL", "kategori": "Staff & Admin", "mulai": null, "selesai": null, "pct": 0, "tahap": "Screening" },
      { "posisi": "Staff Purchasing", "entitas": "LBP - BYL", "kategori": "Staff & Admin", "mulai": null, "selesai": null, "pct": 0, "tahap": "Screening" }
    ],
    "kritis": [],
    "clients_b2bint": [
      { "id": 1, "nama": "CV. Loka Bumi Persada", "layanan": "Transformasi SDM dan Operasional", "nilai": 90000000, "pic": "Aziz Yanuar Hidayat", "status": "Aktif" },
      { "id": 2, "nama": "PT. Mutiara Benih Nusantara ", "layanan": "Transformasi SDM dan Operasional", "nilai": null, "pic": "Aziz Yanuar Hidayat", "status": "Aktif" }
    ],
    "pipeline_b2bint": [
      { "id": 1, "nama": "CV. Loka Bumi Persada", "layanan": "Audit Operasional & Analisis Gap Kompetensi", "nilai": 7500000, "pic": "Aziz Yanuar Hidayat", "stage": "Konfirmasi", "prob": 35, "score": 0 }
    ],
    "progres_b2bint": [
      { "id": "1-audit", "clientId": 1, "fase": "Audit Operasional & Analisis Gap Kompetensi", "keterangan": "Penilaian kompetensi menyeluruh terhadap ±80 karyawan eksisting menggunakan kuesioner digital terstruktur, matriks keahlian baku, dan rekomendasi penempatan peran optimal.", "tanggal": "2026-06-13T07:00:00.000Z", "status": "Selesai" },
      { "id": "1-mfg", "clientId": 1, "fase": "Audit Manufaktur (Sektor Hulu)", "keterangan": "Site Visit ke fasilitas manufaktur hulu. Penetapan kapasitas maksimal dan penghitungan safety stock.", "tanggal": "2026-06-19T07:00:00.000Z", "status": "Selesai" },
      { "id": "1-log", "clientId": 1, "fase": "Audit Logistik (Sektor Tengah)", "keterangan": "Site Visit ke pusat logistik dan gudang. Pemetaan lead time armada pengiriman internal antar wilayah.", "tanggal": "2026-06-26T07:00:00.000Z", "status": "Selesai" },
      { "id": "1-rtl", "clientId": 1, "fase": "Audit Retail (Sektor Hilir)", "keterangan": "Pengerjaan drafting oleh SME Freelance untuk merajut rantai fisik dari temuan hulu dan tengah.", "tanggal": "2026-06-26T07:00:00.000Z", "status": "Selesai" },
      { "id": "1-phys", "clientId": 1, "fase": "Audit & Pemetaan Rantai Fisik", "keterangan": "Audit sistem retail hulu (Online), penguncian parameter POS, dan standardisasi penamaan SKU secara menyeluruh.", "tanggal": "2026-06-26T07:00:00.000Z", "status": "Belum" },
      { "id": "1-disc", "clientId": 1, "fase": "Assesement DISC", "keterangan": "Jumlah +/- 20 karyawan level SPV Up sudah selesai mengerjakan DISC", "tanggal": "2026-07-02T07:00:00.000Z", "status": "Proses" },
      { "id": "2-coord", "clientId": 2, "fase": "Koordinasi dengan Manajemen MBN", "keterangan": "Meeting Online dengan NEU serta ", "tanggal": null, "status": "Belum" }
    ],
    "checklist_b2bint": [
      { "id": 1783045464591, "clientId": 1, "task": "Assesment DISC, WPT, & BEI", "date": "2026-07-11T07:00:00.000Z", "status": "Proses Kerja", "link": "https://docs.google.com/spreadsheets/d/1PBX_3HcCA1BZBWqE0yvprt-kJXzwTScMED80JzvpWFQ/edit?usp=sharing" },
      { "id": 1783045572297, "clientId": 1, "task": "Assesment Operasional LBP", "date": "2026-07-11T07:00:00.000Z", "status": "Proses Kerja", "link": "https://docs.google.com/spreadsheets/d/1ng3Cs_7xb_WenoTGfurFyReXeBqTXjueq-Gw9EihbvM/edit?usp=sharing" },
      { "id": 1783045727909, "clientId": 2, "task": null, "date": "2026-07-03T07:00:00.000Z", "status": "Belum Mulai", "link": null }
    ],
    "clients_b2bext": [],
    "pipeline_b2bext": [],
    "progres_b2bext": [],
    "checklist_b2bext": [],
    "training_offline": [
      { "id": 1, "nama": "Offline Class E-commerce Solo", "tanggal": "2026-07-28T07:00:00.000Z", "tempat": "Solo", "trainer": null, "peserta": null, "status": "Pipeline" },
      { "id": 2, "nama": "Offline Class E- Commerce Yogyakarta", "tanggal": "2026-07-30T07:00:00.000Z", "tempat": "Yogyakarta", "trainer": null, "peserta": null, "status": "Pipeline" },
      { "id": 3, "nama": "Offline Class E-Commerce Semarang", "tanggal": "2026-07-31T07:00:00.000Z", "tempat": "Semarang", "trainer": null, "peserta": null, "status": "Pipeline" }
    ],
    "training_online": [
      { "id": 1, "nama": "Webinar Copywriting", "tanggal": null, "tempat": "Zoom meet", "trainer": "Fion Henry", "peserta": null, "status": "Akan Datang" },
      { "id": 2, "nama": "Webinar Affiliate", "tanggal": null, "tempat": "Zoom meet", "trainer": "Hizba m ", "peserta": null, "status": "Pipeline" },
      { "id": 3, "nama": "Webinar Ads", "tanggal": null, "tempat": "Zoom meet", "trainer": null, "peserta": null, "status": "Pipeline" },
      { "id": 4, "nama": "Webinar E-Commerce scale up", "tanggal": null, "tempat": "Zoom meet", "trainer": null, "peserta": null, "status": "Pipeline" }
    ],
    "kelas": [],
    "lms_fase": [
      { "id": 1, "fase": "Proses untuk Pembayaran", "deskripsi": "belum adanya proses pembayaran setelah melakukan check out", "target": 5, "progress": 75, "status": "Berjalan" }
    ],
    "lms_kendala": [
      { "id": 1, "kendala": "legalistas masih menggunakan RUN", "prioritas": "Tinggi", "pic": "icha", "deadline": "2026-07-13T07:00:00.000Z", "status": "Antre" },
      { "id": 2, "kendala": "Perbaikan Xendit", "prioritas": "Rendah", "pic": "Affan", "deadline": null, "status": "Selesai" }
    ],
    "trainer": [
      { "id": 1, "nama": "Bayu Kurniahadi", "bidang": "Marketing", "email": null, "hp": null, "sertifikasi": null, "materi": null, "status": "Aktif" },
      { "id": 2, "nama": "Fery Ferdiansyah", "bidang": null, "email": null, "hp": null, "sertifikasi": null, "materi": null, "status": "Aktif" }
    ],
    "finance_rekap": [],
    "finance_cashflow": [],
    "kas": [
      { "page": "b2b-internal", "id": 1, "tgl": "2026-07-03T07:00:00.000Z", "ket": "Termin 1 (DP 30%)_Dibayarkan sebelum proyek dimulai (Sesi Kick-off Proyek).", "jenis": "masuk", "nominal": 27000000, "auto": false, "autoTag": null, "clientId": null },
      { "page": "b2b-internal", "id": 2, "tgl": "2026-08-03T07:00:00.000Z", "ket": "Termin II (40%)_Dibayarkan pada pertengahan pengerjaan proyek (Pasca-Fase Audit Selesai).", "jenis": "masuk", "nominal": 36000000, "auto": false, "autoTag": null, "clientId": null },
      { "page": "b2b-internal", "id": 3, "tgl": "2026-09-03T07:00:00.000Z", "ket": "Termin III (30%)_Dibayarkan setelah penyerahan berkas dokumen final & closing penutupan proyek.", "jenis": "masuk", "nominal": 27000000, "auto": false, "autoTag": null, "clientId": null },
      { "page": "lms", "id": 9, "tgl": "2026-06-13T07:00:00.000Z", "ket": "Uang LMS", "jenis": "masuk", "nominal": 5000000, "auto": false, "autoTag": null, "clientId": null },
      { "page": "lms", "id": 10, "tgl": "2026-06-15T07:00:00.000Z", "ket": "Hostinger", "jenis": "keluar", "nominal": 273118, "auto": false, "autoTag": null, "clientId": null },
      { "page": "lms", "id": 11, "tgl": "2026-06-17T07:00:00.000Z", "ket": "domain 1 tahun", "jenis": "keluar", "nominal": 182665, "auto": false, "autoTag": null, "clientId": null }
    ],
    "forecast": [
      { "bulan": "Januari", "divisi": "Headhunter", "target": 0, "fc": 0, "real": 0, "catatan": null }
    ],
    "forecast_cost": [],
    "mitigasi": [],
    "leads": [],
    "channel_cost": [],
    "content_tracking": [],
    "cap_trainer": [],
    "staff_load": [
      { "id": 1, "nama": "Dewi", "divisi": "Head ", "aktivitas": "Kelas Offline E-commerce ", "frekuensi": "Bulanan", "tugas": 3, "kapasitas": 3, "kpi": null, "status": "Berat" },
      { "id": 2, "nama": "Dewi", "divisi": "Head", "aktivitas": "Kelas online Digital Marketing ", "frekuensi": "Bulanan", "tugas": 3, "kapasitas": 4, "kpi": null, "status": "Normal" },
      { "id": 3, "nama": "Yanuar ", "divisi": "Ast Head", "aktivitas": "Lbp Project ", "frekuensi": "Bulanan", "tugas": 1, "kapasitas": 1, "kpi": null, "status": "Berat" },
      { "id": 4, "nama": "Yanuar ", "divisi": "Ast Head ", "aktivitas": "Mbn Project ", "frekuensi": "Bulanan", "tugas": 1, "kapasitas": 1, "kpi": null, "status": "Berat" },
      { "id": 5, "nama": "Icha ", "divisi": "Staff", "aktivitas": "Lms Project ", "frekuensi": "Bulanan", "tugas": 1, "kapasitas": 1, "kpi": null, "status": "Normal" },
      { "id": 6, "nama": "Icha ", "divisi": "Staff", "aktivitas": "Record Materi Project", "frekuensi": "Bulanan", "tugas": 3, "kapasitas": 4, "kpi": null, "status": "Normal" },
      { "id": 7, "nama": "Zaki", "divisi": "Specialist ", "aktivitas": "Hire Project ", "frekuensi": "Bulanan", "tugas": 10, "kapasitas": 15, "kpi": null, "status": "Normal" }
    ],
    "nps": [],
    "feedback": [],
    "documents": []
  },
  "config": {
    "saldoAwal": 0,
    "sheetLeadsUrl": null,
    "sheetCashUrl": null,
    "sheetAuto": false,
    "idSeq": 3,
    "kasIdSeq": 12,
    "docSeq": 1,
    "globalFilter": "all",
    "globalCostSeg": "all",
    "globalFilterBulan": "all"
  }
};

const INDO_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const ENG_MONTHS = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];

function mapIndoToEngMonth(indo: string): string | null {
  const idx = INDO_MONTHS.findIndex(m => m.toLowerCase() === String(indo).toLowerCase());
  return idx !== -1 ? ENG_MONTHS[idx] : null;
}

// In-Memory Database State
let cachedDbState: typeof FALLBACK_TEMPLATE | null = null;

let isFetching = false;
let fetchPromise: Promise<any> | null = null;
let fileCache: Record<string, string> = {};

// Get the Apps Script URL
export function getScriptUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('NEXT_PUBLIC_SCRIPT_API_URL') || process.env.NEXT_PUBLIC_SCRIPT_API_URL || '';
}

// Set the Apps Script URL dynamically
export function setScriptUrl(url: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('NEXT_PUBLIC_SCRIPT_API_URL', url.trim());
  cachedDbState = null; // reset cache
}

// Load current full state from Google Sheet
export async function getDbState(forceRefresh = false): Promise<typeof FALLBACK_TEMPLATE> {
  if (typeof window === 'undefined') return FALLBACK_TEMPLATE;

  if (cachedDbState && !forceRefresh) {
    return cachedDbState;
  }

  const scriptUrl = getScriptUrl();

  // If no script URL is set, return FALLBACK_TEMPLATE directly
  if (!scriptUrl) {
    cachedDbState = JSON.parse(JSON.stringify(FALLBACK_TEMPLATE));
    return cachedDbState!;
  }

  // If already fetching, return current promise
  if (isFetching && fetchPromise) {
    return fetchPromise;
  }

  isFetching = true;
  fetchPromise = fetch(scriptUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    mode: 'cors',
    keepalive: true
  })
    .then(async (res) => {
      const json = await res.json();
      if (json.ok && json.data) {
        cachedDbState = json.data;
        return cachedDbState!;
      }
      throw new Error(json.error || 'Failed to parse sheets response');
    })
    .catch((err) => {
      console.warn('Google Sheet fetch error, falling back to in-memory template:', err);
      cachedDbState = JSON.parse(JSON.stringify(FALLBACK_TEMPLATE));
      return cachedDbState!;
    })
    .finally(() => {
      isFetching = false;
      fetchPromise = null;
    });

  return fetchPromise;
}

// Save the full state to Google Sheet (and local storage cache)
async function saveDbState(state: typeof FALLBACK_TEMPLATE): Promise<void> {
  if (typeof window === 'undefined') return;

  cachedDbState = state;

  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    throw new Error('Google Apps Script URL is not configured.');
  }

  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // Vital to avoid CORS OPTIONS preflight block by GAS!
      },
      body: JSON.stringify({
        mode: 'writeAll',
        sheets: state.sheets,
        config: state.config
      }),
      keepalive: true
    });
    const json = await res.json();
    if (!json.ok) {
      console.error('Error writing to spreadsheet:', json.error);
      throw new Error(json.error || 'Gagal menyimpan data ke Google Spreadsheet');
    }
  } catch (err: any) {
    console.error('Error sending POST request to Google Sheet:', err);
    throw err;
  }
}

// Generate a random string representing UUID
function generateUUID(): string {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Map database fields to standard columns
function mapFieldName(field: string): string {
  if (field === 'client_id') return 'clientId';
  if (field === 'target_date') return 'date';
  if (field === 'created_at') return 'created';
  if (field === 'divisi') return 'page'; // in kas, divisi maps to page
  return field;
}

// MAP READ: maps Spreadsheet sheet rows to Supabase API format
function mapTableRead(tableName: string, state: typeof FALLBACK_TEMPLATE): any[] {
  const sheets = state.sheets;

  if (tableName === 'rekrutmen') {
    return (sheets.rekrutmen || []).map((r, i) => ({
      id: r.id || `rekr_${i}`,
      posisi: r.posisi || '',
      entitas: r.entitas || '',
      kategori: r.kategori || '',
      mulai: r.mulai || null,
      selesai: r.selesai || null,
      pct: Number(r.pct) || 0,
      tahap: r.tahap || '',
      catatan: r.catatan || '',
      file_ol: r.file_ol || '',
      karyawan: r.karyawan || '',
      media: r.media || '',
      deadline: r.deadline || null,
      lokasi: r.lokasi || '',
      created_at: r.created_at || new Date().toISOString(),
      updated_at: r.updated_at || new Date().toISOString()
    }));
  }

  if (tableName === 'kritis') {
    return (sheets.kritis || []).map((r, i) => ({
      id: r.id || `kritis_${i}`,
      posisi: r.posisi || '',
      entitas: r.entitas || '',
      prioritas: r.prioritas || 'Sedang',
      deadline: r.deadline || null,
      catatan: r.catatan || '',
      created_at: r.created || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  if (tableName === 'b2b_clients') {
    const intRows = (sheets.clients_b2bint || []).map(r => ({
      id: String(r.id), scope: 'internal', nama: r.nama, layanan: r.layanan, nilai: Number(r.nilai) || null, pic: r.pic, status: r.status
    }));
    const extRows = (sheets.clients_b2bext || []).map(r => ({
      id: String(r.id), scope: 'external', nama: r.nama, layanan: r.layanan, nilai: Number(r.nilai) || null, pic: r.pic, status: r.status
    }));
    return [...intRows, ...extRows];
  }

  if (tableName === 'b2b_pipeline') {
    const intRows = (sheets.pipeline_b2bint || []).map((r, idx) => ({
      id: String(r.id || `pipe_int_${idx}`), scope: 'internal', nama: r.nama, layanan: r.layanan, nilai: Number(r.nilai) || 0, pic: r.pic, stage: r.stage, prob: Number(r.prob) || 0, score: Number(r.score) || 0
    }));
    const extRows = (sheets.pipeline_b2bext || []).map((r, idx) => ({
      id: String(r.id || `pipe_ext_${idx}`), scope: 'external', nama: r.nama, layanan: r.layanan, nilai: Number(r.nilai) || 0, pic: r.pic, stage: r.stage, prob: Number(r.prob) || 0, score: Number(r.score) || 0
    }));
    return [...intRows, ...extRows];
  }

  if (tableName === 'b2b_checklist') {
    const intRows = (sheets.checklist_b2bint || []).map(r => ({
      id: String(r.id), scope: 'internal', client_id: String(r.clientId), task: r.task, target_date: r.date || null, status: r.status, link: r.link || ''
    }));
    const extRows = (sheets.checklist_b2bext || []).map(r => ({
      id: String(r.id), scope: 'external', client_id: String(r.clientId), task: r.task, target_date: r.date || null, status: r.status, link: r.link || ''
    }));
    return [...intRows, ...extRows];
  }

  if (tableName === 'b2b_progres') {
    const intRows = (sheets.progres_b2bint || []).map((r, idx) => ({
      id: String(r.id || `prog_int_${idx}`), client_id: String(r.clientId), fase: r.fase, keterangan: r.keterangan, tanggal: r.tanggal || null, status: r.status
    }));
    const extRows = (sheets.progres_b2bext || []).map((r, idx) => ({
      id: String(r.id || `prog_ext_${idx}`), client_id: String(r.clientId), fase: r.fase, keterangan: r.keterangan, tanggal: r.tanggal || null, status: r.status
    }));
    return [...intRows, ...extRows];
  }

  if (tableName === 'batch_offline') {
    return (sheets.training_offline || []).map((r, i) => ({
      id: String(r.id || `off_${i}`), nama: r.nama, tanggal: r.tanggal || null, tempat: r.tempat, trainer: r.trainer, peserta: Number(r.peserta) || 0, status: r.status
    }));
  }

  if (tableName === 'batch_online') {
    return (sheets.training_online || []).map((r, i) => ({
      id: String(r.id || `on_${i}`), nama: r.nama, tanggal: r.tanggal || null, tempat: r.tempat, trainer: r.trainer, peserta: Number(r.peserta) || 0, status: r.status
    }));
  }

  if (tableName === 'kelas') {
    return (sheets.kelas || []).map((r, i) => ({
      id: String(r.id || `kelas_${i}`), nama: r.nama, kategori: r.kategori, modul: Number(r.modul) || 0, peserta: Number(r.peserta) || 0, targetPeserta: Number(r.targetPeserta) || 0, modulLink: r.modulLink || '', progress: Number(r.progress) || 0, status: r.status
    }));
  }

  if (tableName === 'lms_fase') {
    return (sheets.lms_fase || []).map((r, i) => ({
      id: String(r.id || `lmsf_${i}`), fase: r.fase, deskripsi: r.deskripsi, target: Number(r.target) || 0, progress: Number(r.progress) || 0, status: r.status
    }));
  }

  if (tableName === 'lms_kendala') {
    return (sheets.lms_kendala || []).map((r, i) => ({
      id: String(r.id || `lmsk_${i}`), kendala: r.kendala, prioritas: r.prioritas, pic: r.pic, deadline: r.deadline || null, status: r.status
    }));
  }

  if (tableName === 'trainer') {
    return (sheets.trainer || []).map((r, i) => ({
      id: String(r.id || `train_${i}`), nama: r.nama, bidang: r.bidang || '', email: r.email || '', hp: r.hp || '', sertifikasi: r.sertifikasi || '', materi: r.materi || '', status: r.status
    }));
  }

  if (tableName === 'fin_rekap') {
    return (sheets.finance_rekap || []).map((r, i) => ({
      id: String(r.id || `rekap_${i}`), divisi: r.divisi, masuk: Number(r.masuk) || 0, keluar: Number(r.keluar) || 0, ket: r.ket || '', created_at: new Date().toISOString()
    }));
  }

  if (tableName === 'cashflow') {
    return (sheets.finance_cashflow || []).map((r, i) => ({
      id: String(r.id || `cf_${i}`), tanggal: r.tanggal, tipe: r.tipe, kategori: r.kategori, divisi: r.divisi, nominal: Number(r.nominal) || 0, created_at: new Date().toISOString()
    }));
  }

  if (tableName === 'kas') {
    return (sheets.kas || []).map(k => {
      let ket = String(k.ket || '');
      let file_url = '';
      const match = ket.match(/(.*) \[file_url: (.*)\]/);
      if (match) {
        ket = match[1];
        file_url = match[2];
      }
      return {
        id: String(k.id),
        divisi: k.page, // maps page -> divisi
        tgl: k.tgl,
        ket,
        jenis: k.jenis,
        nominal: Number(k.nominal) || 0,
        file_url,
        created_at: new Date().toISOString()
      };
    });
  }

  if (tableName === 'forecast') {
    // Pivot forecast sheet rows to dashboard format
    const rows = sheets.forecast || [];
    const grouped: Record<string, any> = {};
    rows.forEach(r => {
      let bulan = r.bulan || 'Januari';
      let divisi = r.divisi || '';
      let target = Number(r.target) || 0;

      let tahun = 2026;
      let monthName = bulan;
      const match = String(bulan).match(/^(\d{4})-(.*)$/);
      if (match) {
        tahun = parseInt(match[1]);
        monthName = match[2];
      }

      const key = `${divisi}||${tahun}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: `${divisi}-${tahun}`,
          divisi,
          tahun,
          jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const engMonth = mapIndoToEngMonth(monthName);
      if (engMonth) {
        grouped[key][engMonth] = target;
      }
    });
    return Object.values(grouped);
  }

  if (tableName === 'forecast_cost') {
    return (sheets.forecast_cost || []).map((r, i) => {
      let catatan = String(r.catatan || '');
      let tahun = 2026;
      const match = catatan.match(/(.*) \[year: (\d+)\]/);
      if (match) {
        catatan = match[1];
        tahun = parseInt(match[2]);
      }
      return {
        id: String(r.id || `cost_${i}`),
        kategori: r.divisi || '', // maps divisi -> kategori
        tipe: r.vendor || 'Fixed', // maps vendor -> tipe
        tahun,
        jan: Number(r.jan) || 0,
        feb: Number(r.feb) || 0,
        mar: Number(r.mar) || 0,
        apr: Number(r.apr) || 0,
        mei: Number(r.mei) || 0,
        jun: Number(r.jun) || 0,
        jul: Number(r.jul) || 0,
        agu: Number(r.agu) || 0,
        sep: Number(r.sep) || 0,
        okt: Number(r.okt) || 0,
        nov: Number(r.nov) || 0,
        des: Number(r.des) || 0,
        catatan,
        created_at: new Date().toISOString()
      };
    });
  }

  if (tableName === 'mitigasi') {
    return (sheets.mitigasi || []).map((r, i) => {
      const parts = (r.tab || '').split('||');
      const probabilitas = parts[0] || 'Rendah';
      const prioritas = parts[1] || 'Sedang';
      return {
        id: String(r.id || `mit_${i}`),
        risiko: r.kendala || '',
        dampak: r.mitigasi || '',
        probabilitas,
        prioritas,
        pic: r.pic || '',
        deadline: r.deadline || null,
        tindakan: r.solving || '',
        status: r.status || '',
        created_at: r.created || new Date().toISOString()
      };
    });
  }

  if (tableName === 'leads') {
    return (sheets.leads || []).map((r, i) => ({
      id: String(r.id || `lead_${i}`),
      nama: r.nama || '',
      channel: r.channel || '',
      stage: r.stage || '',
      last_interaction: r.last || '',
      notes: r.notes || '',
      pic: r.pic || '',
      est: Number(r.est) || 0,
      kontak: r.kontak || '',
      created_at: new Date().toISOString()
    }));
  }

  if (tableName === 'channel_cost') {
    return (sheets.channel_cost || []).map((r, i) => ({
      id: String(r.id || `cc_${i}`), channel: r.channel || '', biaya: Number(r.biaya) || 0
    }));
  }

  if (tableName === 'content_tracking') {
    return (sheets.content_tracking || []).map((r, i) => ({
      id: String(r.id || `cnt_${i}`), minggu: r.minggu || '', stage: r.stage || '', platform: r.platform || '', judul: r.judul || '', status: r.status || '', link: r.link || '', views: Number(r.views) || 0, engagement: Number(r.engagement) || 0
    }));
  }

  if (tableName === 'cap_trainer') {
    return (sheets.cap_trainer || []).map((r, i) => ({
      id: String(r.id || `cap_${i}`), nama: r.nama || '', max_batch: Number(r.kapasitas) || 0, current_batch: Number(r.terpakai) || 0, status: r.status || ''
    }));
  }

  if (tableName === 'staff_load') {
    return (sheets.staff_load || []).map((r, i) => ({
      id: String(r.id || `staff_${i}`), nama: r.nama || '', jabatan: r.divisi || '', current_jam: Number(r.tugas) || 0, max_jam: Number(r.kapasitas) || 0, kpi: r.kpi || '', status: r.status || ''
    }));
  }

  if (tableName === 'nps') {
    return (sheets.nps || []).map((r, i) => ({
      id: String(r.id || `nps_${i}`), klien: r.klien || '', tanggal: r.periode || '', skor: Number(r.skor) || 0, komentar: r.catatan || ''
    }));
  }

  if (tableName === 'feedback') {
    return (sheets.feedback || []).map((r, i) => ({
      id: String(r.id || `fb_${i}`), tanggal: r.tanggal || '', klien: r.client || '', isi: r.feedback || '', sentimen: r.sentimen || '', kategori: r.tindak || '', status: r.status || ''
    }));
  }

  if (tableName === 'documents') {
    return (sheets.documents || []).map((r, i) => ({
      id: String(r.id || `doc_${i}`), kode: r.kode || '', nama: r.nama || '', tipe: r.tipe || '', entitas: r.entitas || '', tanggal: r.tanggal || '', versi: r.versi || '', url: r.url || ''
    }));
  }

  // Settings table is a virtual mapping of _config
  if (tableName === 'settings') {
    return Object.entries(state.config).map(([k, v]) => ({
      key: k === 'saldoAwal' ? 'saldo_awal' : k,
      value: String(v)
    }));
  }

  return [];
}

// MAP WRITE RAW: writes the complete rows list of a table back to the Spreadsheet state
function mapTableWriteRaw(tableName: string, allRows: any[], state: typeof FALLBACK_TEMPLATE) {
  const sheets = state.sheets;

  if (tableName === 'rekrutmen') {
    sheets.rekrutmen = allRows.map(r => ({
      id: r.id, posisi: r.posisi, entitas: r.entitas, kategori: r.kategori, mulai: r.mulai, selesai: r.selesai, pct: r.pct, tahap: r.tahap, catatan: r.catatan, file_ol: r.file_ol, karyawan: r.karyawan, media: r.media, deadline: r.deadline, lokasi: r.lokasi
    }));
  }
  else if (tableName === 'kritis') {
    sheets.kritis = allRows.map(r => ({
      id: r.id, posisi: r.posisi, entitas: r.entitas, prioritas: r.prioritas, deadline: r.deadline, catatan: r.catatan, created: r.created_at || r.created
    }));
  }
  else if (tableName === 'b2b_clients') {
    sheets.clients_b2bint = allRows.filter(r => r.scope === 'internal').map(r => ({
      id: r.id, nama: r.nama, layanan: r.layanan, nilai: r.nilai, pic: r.pic, status: r.status
    }));
    sheets.clients_b2bext = allRows.filter(r => r.scope === 'external').map(r => ({
      id: r.id, nama: r.nama, layanan: r.layanan, nilai: r.nilai, pic: r.pic, status: r.status
    }));
  }
  else if (tableName === 'b2b_pipeline') {
    sheets.pipeline_b2bint = allRows.filter(r => r.scope === 'internal').map(r => ({
      id: r.id, nama: r.nama, layanan: r.layanan, nilai: r.nilai, pic: r.pic, stage: r.stage, prob: r.prob, score: r.score
    }));
    sheets.pipeline_b2bext = allRows.filter(r => r.scope === 'external').map(r => ({
      id: r.id, nama: r.nama, layanan: r.layanan, nilai: r.nilai, pic: r.pic, stage: r.stage, prob: r.prob, score: r.score
    }));
  }
  else if (tableName === 'b2b_checklist') {
    sheets.checklist_b2bint = allRows.filter(r => r.scope === 'internal').map(r => ({
      id: r.id, clientId: r.client_id, task: r.task, date: r.target_date, status: r.status, link: r.link
    }));
    sheets.checklist_b2bext = allRows.filter(r => r.scope === 'external').map(r => ({
      id: r.id, clientId: r.client_id, task: r.task, date: r.target_date, status: r.status, link: r.link
    }));
  }
  else if (tableName === 'b2b_progres') {
    const intClients = new Set((sheets.clients_b2bint || []).map(c => String(c.id)));
    sheets.progres_b2bint = allRows.filter(r => intClients.has(String(r.client_id))).map(r => ({
      id: r.id, clientId: r.client_id, fase: r.fase, keterangan: r.keterangan, tanggal: r.tanggal, status: r.status
    }));
    sheets.progres_b2bext = allRows.filter(r => !intClients.has(String(r.client_id))).map(r => ({
      id: r.id, clientId: r.client_id, fase: r.fase, keterangan: r.keterangan, tanggal: r.tanggal, status: r.status
    }));
  }
  else if (tableName === 'batch_offline') {
    sheets.training_offline = allRows.map(r => ({
      id: r.id, nama: r.nama, tanggal: r.tanggal, tempat: r.tempat, trainer: r.trainer, peserta: r.peserta, status: r.status
    }));
  }
  else if (tableName === 'batch_online') {
    sheets.training_online = allRows.map(r => ({
      id: r.id, nama: r.nama, tanggal: r.tanggal, tempat: r.tempat, trainer: r.trainer, peserta: r.peserta, status: r.status
    }));
  }
  else if (tableName === 'kelas') {
    sheets.kelas = allRows.map(r => ({
      id: r.id, nama: r.nama, kategori: r.kategori, modul: r.modul, peserta: r.peserta, targetPeserta: r.targetPeserta, modulLink: r.modulLink, progress: r.progress, status: r.status
    }));
  }
  else if (tableName === 'lms_fase') {
    sheets.lms_fase = allRows.map(r => ({
      id: r.id, fase: r.fase, deskripsi: r.deskripsi, target: r.target, progress: r.progress, status: r.status
    }));
  }
  else if (tableName === 'lms_kendala') {
    sheets.lms_kendala = allRows.map(r => ({
      id: r.id, kendala: r.kendala, prioritas: r.prioritas, pic: r.pic, deadline: r.deadline, status: r.status
    }));
  }
  else if (tableName === 'trainer') {
    sheets.trainer = allRows.map(r => ({
      id: r.id, nama: r.nama, bidang: r.bidang, email: r.email, hp: r.hp, sertifikasi: r.sertifikasi, materi: r.materi, status: r.status
    }));
  }
  else if (tableName === 'fin_rekap') {
    sheets.finance_rekap = allRows.map(r => ({
      id: r.id, divisi: r.divisi, masuk: r.masuk, keluar: r.keluar, ket: r.ket
    }));
  }
  else if (tableName === 'cashflow') {
    sheets.finance_cashflow = allRows.map(r => ({
      id: r.id, tanggal: r.tanggal, tipe: r.tipe, kategori: r.kategori, divisi: r.divisi, nominal: r.nominal
    }));
  }
  else if (tableName === 'kas') {
    sheets.kas = allRows.map(r => {
      const ket = r.file_url ? `${r.ket || ''} [file_url: ${r.file_url}]` : (r.ket || '');
      return {
        page: r.divisi, // page <- divisi
        id: r.id,
        tgl: r.tgl,
        ket,
        jenis: r.jenis,
        nominal: r.nominal,
        auto: r.auto || false,
        autoTag: r.autoTag || null,
        clientId: r.clientId || null
      };
    });
  }
  else if (tableName === 'forecast') {
    // Unpivot Pivoted Rows back into Monthly Rows in forecast sheet
    const newSheetRows: any[] = [];
    allRows.forEach(row => {
      const divisi = row.divisi;
      const tahun = row.tahun || 2026;
      const catatan = row.catatan || '';

      ENG_MONTHS.forEach((m, idx) => {
        const target = Number(row[m]) || 0;
        newSheetRows.push({
          bulan: `${tahun}-${INDO_MONTHS[idx]}`,
          divisi,
          target,
          fc: target,
          real: 0,
          catatan
        });
      });
    });
    sheets.forecast = newSheetRows;
  }
  else if (tableName === 'forecast_cost') {
    sheets.forecast_cost = allRows.map(r => {
      const catatan = r.catatan ? `${r.catatan || ''} [year: ${r.tahun || 2026}]` : `[year: ${r.tahun || 2026}]`;
      return {
        id: r.id,
        vendor: r.tipe || 'Fixed', // vendor <- tipe
        divisi: r.kategori || '', // divisi <- kategori
        jan: r.jan, feb: r.feb, mar: r.mar, apr: r.apr, mei: r.mei, jun: r.jun,
        jul: r.jul, agu: r.agu, sep: r.sep, okt: r.okt, nov: r.nov, des: r.des,
        catatan
      };
    });
  }
  else if (tableName === 'mitigasi') {
    sheets.mitigasi = allRows.map(r => {
      const tab = `${r.probabilitas || 'Rendah'}||${r.prioritas || 'Sedang'}`;
      return {
        id: r.id,
        tab,
        kendala: r.risiko,
        mitigasi: r.dampak,
        solving: r.tindakan,
        pic: r.pic,
        deadline: r.deadline,
        status: r.status,
        created: r.created_at || r.created
      };
    });
  }
  else if (tableName === 'leads') {
    sheets.leads = allRows.map(r => ({
      id: r.id, nama: r.nama, kontak: r.kontak, channel: r.channel, stage: r.stage, last: r.last_interaction, est: r.est, pic: r.pic, notes: r.notes
    }));
  }
  else if (tableName === 'channel_cost') {
    sheets.channel_cost = allRows.map(r => ({
      id: r.id, channel: r.channel, biaya: r.biaya
    }));
  }
  else if (tableName === 'content_tracking') {
    sheets.content_tracking = allRows.map(r => ({
      id: r.id, minggu: r.minggu, stage: r.stage, platform: r.platform, judul: r.judul, status: r.status, link: r.link, views: r.views, engagement: r.engagement
    }));
  }
  else if (tableName === 'cap_trainer') {
    sheets.cap_trainer = allRows.map(r => ({
      id: r.id, nama: r.nama, kapasitas: r.max_batch, terpakai: r.current_batch, status: r.status
    }));
  }
  else if (tableName === 'staff_load') {
    sheets.staff_load = allRows.map(r => ({
      id: r.id, nama: r.nama, divisi: r.jabatan, aktivitas: r.aktivitas || '', frekuensi: r.frekuensi || '', tugas: r.current_jam, kapasitas: r.max_jam, kpi: r.kpi, status: r.status
    }));
  }
  else if (tableName === 'nps') {
    sheets.nps = allRows.map(r => ({
      id: r.id, klien: r.klien, periode: r.tanggal, skor: r.skor, catatan: r.komentar
    }));
  }
  else if (tableName === 'feedback') {
    sheets.feedback = allRows.map(r => ({
      id: r.id, tanggal: r.tanggal, client: r.klien, feedback: r.isi, sentimen: r.sentimen, tindak: r.kategori, status: r.status
    }));
  }
  else if (tableName === 'documents') {
    sheets.documents = allRows.map(r => ({
      id: r.id, kode: r.kode, nama: r.nama, tipe: r.tipe, entitas: r.entitas, tanggal: r.tanggal, versi: r.versi, url: r.url
    }));
  }
  else if (tableName === 'settings') {
    allRows.forEach(r => {
      const key = r.key === 'saldo_awal' ? 'saldoAwal' : r.key;
      state.config[key] = r.value;
    });
  }
}

// Custom helper to dispatch global toast messages for spreadsheet updates
function notifyChange(message: string, type: 'success' | 'error' | 'info') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('neuverse-toast', { detail: { message, type } });
    window.dispatchEvent(event);
  }
}

function getFriendlyName(tableName: string): string {
  const names: Record<string, string> = {
    rekrutmen: 'Data Rekrutmen',
    kritis: 'Kebutuhan Kritis',
    b2b_clients: 'Klien B2B',
    b2b_pipeline: 'Pipeline B2B',
    b2b_checklist: 'Checklist B2B',
    b2b_progres: 'Progres B2B',
    batch_offline: 'Training Offline',
    batch_online: 'Training Online',
    kelas: 'Data Kelas',
    lms_fase: 'Fase LMS',
    lms_kendala: 'Kendala LMS',
    trainer: 'Data Trainer',
    fin_rekap: 'Rekap Finansial',
    cashflow: 'Data Cashflow',
    kas: 'Transaksi Buku Kas',
    forecast: 'Forecasting',
    forecast_cost: 'Forecast Biaya',
    mitigasi: 'Mitigasi Resiko',
    leads: 'Data Leads',
    channel_cost: 'Biaya Channel',
    content_tracking: 'Konten',
    cap_trainer: 'Kapasitas Trainer',
    staff_load: 'Staff Load',
    nps: 'Skor NPS',
    feedback: 'Feedback Klien',
    documents: 'Dokumen',
    settings: 'Pengaturan Saldo',
  };
  return names[tableName] || 'Data';
}

// Custom Query Builder mimicry of Supabase Client
class QueryBuilder {
  tableName: string;
  filters: { field: string; value: any }[] = [];
  orderByField: string | null = null;
  orderAscending: boolean = true;
  singleRow: boolean = false;
  action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  payload: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = '*') {
    this.action = 'select';
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value });
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderByField = field;
    this.orderAscending = options.ascending ?? true;
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  insert(payload: any) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  // Mimic Promise compatibility so we can await the query directly
  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any);
  }

  async execute() {
    if (this.action === 'select') {
      return this.executeSelect();
    } else if (this.action === 'insert') {
      return this.executeInsert();
    } else if (this.action === 'update') {
      return this.executeUpdate();
    } else if (this.action === 'delete') {
      return this.executeDelete();
    }
    throw new Error(`Unknown action: ${this.action}`);
  }

  async executeSelect() {
    const state = await getDbState();
    let data = mapTableRead(this.tableName, state);

    // Apply filters
    for (const f of this.filters) {
      data = data.filter((row: any) => {
        return String(row[f.field] !== undefined ? row[f.field] : '') === String(f.value);
      });
    }

    // Apply sorting
    if (this.orderByField) {
      data = [...data].sort((a: any, b: any) => {
        const valA = a[this.orderByField!];
        const valB = b[this.orderByField!];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    if (this.singleRow) {
      return { data: data[0] || null, error: null };
    }

    return { data, error: null };
  }

  async executeInsert() {
    notifyChange(`Menyimpan ${getFriendlyName(this.tableName)} baru ke Sheets...`, 'info');
    try {
      const state = await getDbState();
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];

      const currentRows = mapTableRead(this.tableName, state);

      const newRows = rows.map((r, index) => {
        const mapped = { ...r };
        if (!mapped.id) {
          if (this.tableName === 'kas') {
            mapped.id = Number(state.config.kasIdSeq || 1) + index;
          } else if (this.tableName === 'documents') {
            mapped.id = Number(state.config.docSeq || 1) + index;
          } else if (['b2b_clients', 'b2b_pipeline', 'b2b_checklist', 'b2b_progres'].includes(this.tableName)) {
            mapped.id = Number(state.config.idSeq || 1) + index;
          } else {
            mapped.id = generateUUID();
          }
        }
        mapped.created_at = new Date().toISOString();
        mapped.updated_at = new Date().toISOString();
        return mapped;
      });

      // Update seqs in config
      if (this.tableName === 'kas') {
        state.config.kasIdSeq = Number(state.config.kasIdSeq || 1) + newRows.length;
      } else if (this.tableName === 'documents') {
        state.config.docSeq = Number(state.config.docSeq || 1) + newRows.length;
      } else if (['b2b_clients', 'b2b_pipeline', 'b2b_checklist', 'b2b_progres'].includes(this.tableName)) {
        state.config.idSeq = Number(state.config.idSeq || 1) + newRows.length;
      }

      const mergedRows = [...currentRows, ...newRows];
      mapTableWriteRaw(this.tableName, mergedRows, state);

      await saveDbState(state);
      notifyChange(`${getFriendlyName(this.tableName)} berhasil ditambahkan!`, 'success');

      return { data: Array.isArray(this.payload) ? newRows : newRows[0], error: null };
    } catch (err: any) {
      notifyChange(`Gagal menambahkan ${getFriendlyName(this.tableName)}: ${err.message || err}`, 'error');
      throw err;
    }
  }

  async executeUpdate() {
    notifyChange(`Menyimpan perubahan ${getFriendlyName(this.tableName)} ke Sheets...`, 'info');
    try {
      const state = await getDbState();
      let allRows = mapTableRead(this.tableName, state);

      const updatedRows: any[] = [];
      allRows = allRows.map((row: any) => {
        let match = true;
        for (const f of this.filters) {
          if (String(row[f.field] !== undefined ? row[f.field] : '') !== String(f.value)) {
            match = false;
            break;
          }
        }
        if (match) {
          const updated = { ...row, ...this.payload, updated_at: new Date().toISOString() };
          updatedRows.push(updated);
          return updated;
        }
        return row;
      });

      mapTableWriteRaw(this.tableName, allRows, state);
      await saveDbState(state);
      notifyChange(`${getFriendlyName(this.tableName)} berhasil diperbarui!`, 'success');

      return { data: updatedRows, error: null };
    } catch (err: any) {
      notifyChange(`Gagal memperbarui ${getFriendlyName(this.tableName)}: ${err.message || err}`, 'error');
      throw err;
    }
  }

  async executeDelete() {
    notifyChange(`Menghapus ${getFriendlyName(this.tableName)} dari Sheets...`, 'info');
    try {
      const state = await getDbState();
      let allRows = mapTableRead(this.tableName, state);

      allRows = allRows.filter((row: any) => {
        let match = true;
        for (const f of this.filters) {
          if (String(row[f.field] !== undefined ? row[f.field] : '') !== String(f.value)) {
            match = false;
            break;
          }
        }
        return !match;
      });

      mapTableWriteRaw(this.tableName, allRows, state);
      await saveDbState(state);
      notifyChange(`${getFriendlyName(this.tableName)} berhasil dihapus!`, 'success');

      return { data: null, error: null };
    } catch (err: any) {
      notifyChange(`Gagal menghapus ${getFriendlyName(this.tableName)}: ${err.message || err}`, 'error');
      throw err;
    }
  }
}

// Export virtual supabase client object
export const supabase = {
  from(tableName: string) {
    return new QueryBuilder(tableName);
  },
  
  storage: {
    from(bucketName: string) {
      return {
        async upload(filePath: string, file: File, options?: any): Promise<{ data: { path: string } | null; error: { message: string } | null }> {
          // Convert file to base64 data URL and cache locally
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result as string;
              fileCache[filePath] = dataUrl;
              resolve({ data: { path: filePath }, error: null });
            };
            reader.readAsDataURL(file);
          });
        },
        getPublicUrl(filePath: string): { data: { publicUrl: string } } {
          const publicUrl = fileCache[filePath] || '';
          return { data: { publicUrl } };
        }
      };
    }
  }
};
