// ============================================================
// NEUverse Dashboard — Shared Utilities
// ============================================================

export const formatRp = (n: number | null | undefined): string =>
  'Rp ' + (Number(n) || 0).toLocaleString('id-ID')

export const todayStr = (): string =>
  new Date().toISOString().slice(0, 10)

export const daysSince = (d: string | null | undefined): number | null => {
  if (!d) return null
  const t = new Date(d).getTime()
  if (isNaN(t)) return null
  return Math.floor((Date.now() - t) / 86400000)
}

export const monthKey = (d: string | null | undefined): string | null => {
  if (!d) return null
  const t = new Date(d)
  if (isNaN(t.getTime())) return null
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0')
}

// Lead scoring (identical logic to original dashboard)
export const scoreLead = (l: { channel: string; last_interaction?: string | null; stage: string }): number => {
  let s = 0
  const ch = l.channel
  if (ch === 'Referral' || ch === 'Komunitas') s += 30
  else if (ch === 'LinkedIn') s += 20
  else if (ch === 'Instagram') s += 10
  const d = daysSince(l.last_interaction)
  if (d != null) {
    if (d < 3) s += 25
    else if (d < 7) s += 15
    else if (d > 14) s -= 10
  }
  if (l.stage === 'MQL') s += 10
  else if (l.stage === 'SQL') s += 20
  else if (l.stage === 'Deal') s += 30
  return Math.max(0, Math.min(100, s))
}

export const tempLead = (score: number): 'Hot' | 'Warm' | 'Cold' =>
  score >= 70 ? 'Hot' : score >= 40 ? 'Warm' : 'Cold'

export const npsCat = (skor: number): 'Promoter' | 'Passive' | 'Detractor' =>
  skor >= 9 ? 'Promoter' : skor >= 7 ? 'Passive' : 'Detractor'

export const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
export const MONTH_KEYS = ['jan','feb','mar','apr','mei','jun','jul','agu','sep','okt','nov','des'] as const
export type MonthKey = typeof MONTH_KEYS[number]

export const DIVISI = ['Headhunter','B2B Internal','B2B Eksternal','Courses','LMS','Lainnya']
export const KATEGORI_HH = ['Staff & Admin','Supervisor','Head','Top']
export const TAHAP_HH = ['Screening','Interview','Offering','Selesai']
export const PRIORITAS = ['Urgent','Tinggi','Sedang']
export const CLIENT_STATUS = ['Aktif','Hold','Selesai']
export const STAGE_B2B = ['Prospek','Proposal','Negosiasi','Konfirmasi']
export const PROGRES_STATUS = ['Belum','Proses','Selesai']
export const COURSE_STATUS = ['Pipeline','Akan Datang','Berjalan','Selesai']
export const KELAS_STATUS = ['Baru','Berjalan','Aktif','Selesai']
export const LMS_FASE_STATUS = ['Belum Mulai','Berjalan','Menunggu','Selesai']
export const LMS_PRIORITAS = ['Tinggi','Sedang','Rendah']
export const TRAINER_STATUS = ['Aktif','Baru','Nonaktif']
export const MITIGASI_STATUS = ['Terbuka','Mitigasi','Solved']
export const CAP_STATUS = ['Sehat','Hampir Penuh','Overload']
export const LOAD_STATUS = ['Ringan','Normal','Berat']
export const FREKUENSI = ['Harian','Mingguan','Bulanan','Tahunan']
export const SENTIMEN = ['Positif','Netral','Negatif']
export const FB_STATUS = ['Baru','Ditindaklanjuti','Selesai']
export const CASH_TIPE = ['Revenue','Fixed','Variable'] as const
export const CHK_STATUS = ['Belum Mulai','Proses Kerja','Review Internal','Selesai Acc']
export const FUNNEL_STAGE = ['TOFU (Awareness)','MOFU (Consideration)','BOFU (Conversion)']
export const PLATFORM = ['LinkedIn','Instagram','TikTok','YouTube','Facebook Ads','Referral']
export const CNT_STATUS = ['Ideasi','Produksi Naskah','Editing','Scheduled','Sudah Rilis']
export const LEAD_CH = ['LinkedIn','Instagram','Referral','Komunitas','Lainnya']
export const LEAD_STAGE = ['Lead','MQL','SQL','Deal','Lost']

export const TAG_CLASS: Record<string, string> = {
  'Selesai':'tag-success','Aktif':'tag-success','Solved':'tag-success','Berjalan':'tag-warning',
  'Proses':'tag-warning','Mitigasi':'tag-warning','Hold':'tag-warning','Menunggu':'tag-info',
  'Antre':'tag-info','Pipeline':'tag-info','Belum':'tag-danger','Belum Mulai':'tag-danger',
  'Terbuka':'tag-danger','Urgent':'tag-danger','Tinggi':'tag-warning','Sedang':'tag-info',
  'Rendah':'tag-primary','Akan Datang':'tag-warning','Baru':'tag-info','Nonaktif':'tag-danger',
  'Proposal':'tag-warning','Negosiasi':'tag-info','Konfirmasi':'tag-primary','Prospek':'tag-info',
  'Top':'tag-purple','Head':'tag-primary'
}

export const tagClass = (v: string): string => TAG_CLASS[v] || 'tag-info'

export function alertLevel({ deadline, status, created, priority }: {
  deadline?: string | null
  status?: string | null
  created?: string | null
  priority?: string | null
}): { level: number; cls: string } {
  const now = Date.now()
  const DAY = 86400000
  let level = 0
  if (deadline) {
    const d = new Date(deadline).getTime()
    const diff = d - now
    if (diff < DAY) level = 2
    else if (diff < 3 * DAY && level < 1) level = 1
  }
  if (status === 'Terbuka' && created && (now - new Date(created).getTime()) > 3 * DAY) level = 2
  if (priority === 'Urgent' && level < 1) level = 1
  return { level, cls: level === 2 ? 'row-alert' : level === 1 ? 'row-warn' : '' }
}

export const clsx = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ')
