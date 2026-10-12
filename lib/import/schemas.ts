import { z } from 'zod';

export type ImportTarget = 'inventory' | 'insights' | 'activities' | 'content' | 'events' | 'props';

export interface TargetMetadata {
  id: ImportTarget;
  title: string;
  description: string;
  sampleFileName: string;
  templateCsv: string;
  columns: string[];
}

export const IMPORT_TARGETS: TargetMetadata[] = [
  {
    id: 'inventory',
    title: 'Stok Unit & Snapshot Inventaris',
    description: 'Catatan jumlah unit perumahan subsidi (belum terjual, booking, SP3K, akad, cash, hold).',
    sampleFileName: 'template_import_inventory.csv',
    columns: [
      'project_slug',
      'snapshot_date',
      'belum_terjual',
      'booking',
      'sp3k',
      'akad_kredit',
      'cash_keras',
      'hold_manajemen',
    ],
    templateCsv: `project_slug,snapshot_date,belum_terjual,booking,sp3k,akad_kredit,cash_keras,hold_manajemen
grand-sevilla,2026-10-12,23,11,4,46,2,18
grand-lestari,2026-10-12,26,11,3,23,6,84
harmony-hills,2026-10-12,23,5,2,4,0,4
setia-residence,2026-10-12,87,3,1,0,0,0
samudera-residence,2026-10-12,20,5,1,14,0,18`,
  },
  {
    id: 'insights',
    title: 'Metrik Performa Channel Digital',
    description: 'Data analitik mingguan atau bulanan dari Instagram, Website, Maps, YouTube, dan TikTok.',
    sampleFileName: 'template_import_insights.csv',
    columns: [
      'channel_handle_or_id',
      'period_type',
      'period_start',
      'period_end',
      'metric_key',
      'value',
    ],
    templateCsv: `channel_handle_or_id,period_type,period_start,period_end,metric_key,value
@sedaya_grandsevilla,7d,2026-10-05,2026-10-11,reach,18450
@sedaya_grandsevilla,7d,2026-10-05,2026-10-11,views,32600
@sedaya_grandsevilla,7d,2026-10-05,2026-10-11,profile_visits,640
sedayagroup.id,7d,2026-10-05,2026-10-11,sessions,1240
sedayagroup.id,7d,2026-10-05,2026-10-11,users,950
@sedayaproperty,7d,2026-10-05,2026-10-11,video_views,45200`,
  },
  {
    id: 'activities',
    title: 'Aktivitas Harian PIC',
    description: 'Catatan log aktivitas harian tim branding, desain, posting medsos, dan koordinasi.',
    sampleFileName: 'template_import_activities.csv',
    columns: [
      'activity_date',
      'pic_name',
      'title',
      'description',
      'category',
      'project_slug',
      'status',
      'duration_minutes',
    ],
    templateCsv: `activity_date,pic_name,title,description,category,project_slug,status,duration_minutes
2026-10-12,Ferry Pratama,Review Kampanye Iklan Meta Ads,Evaluasi performa CPL promo akad gratis,reporting_monitoring,grand-sevilla,done,90
2026-10-12,Ziyad,Editing Video Reels Progress Fisik,Pengambilan shoot jalan paving & unit Blok B,content_production,harmony-hills,in_progress,120
2026-10-12,Ziyad,Desain Banner Promo DP 0%,Persiapan materi pameran atrium deli serdang,design,grand-lestari,planned,60`,
  },
  {
    id: 'content',
    title: 'Rencana & Jadwal Konten Editorial',
    description: 'Jadwal postingan media sosial, pilar konten, format, dan penanggung jawab.',
    sampleFileName: 'template_import_content.csv',
    columns: [
      'publish_date',
      'channel_handle',
      'title',
      'pillar',
      'format',
      'status',
      'pic_name',
    ],
    templateCsv: `publish_date,channel_handle,title,pillar,format,status,pic_name
2026-10-13,@sedaya_grandsevilla,Video Fasilitas Jalan Lebar Grand Sevilla,product_info,reel,scheduled,Ziyad
2026-10-14,@sedaya_grandlestari,Syarat Mudah KPR Subsidi bagi Wiraswasta,edu_kpr,carousel,in_production,Ziyad
2026-10-15,@sedayaproperty,Q&A Live: Berapa Lama Proses SP3K Turun?,edu_kpr,video,idea,Ferry Pratama`,
  },
  {
    id: 'events',
    title: 'Pameran & Event Offline',
    description: 'Agenda expo perumahan, pameran mall, dan open booth promosi perumahan.',
    sampleFileName: 'template_import_events.csv',
    columns: [
      'title',
      'event_type',
      'event_date',
      'location',
      'project_slug',
      'budget_planned',
      'target_visitors',
    ],
    templateCsv: `title,event_type,event_date,location,project_slug,budget_planned,target_visitors
Pameran Properti BTN Plaza Medan Fair,special,2026-10-24,Plaza Medan Fair,grand-sevilla,4500000,300
Booth Sosialisasi Karyawan Kawasan Industri KIM,weekly,2026-10-18,KIM Mabar,grand-lestari,1200000,120`,
  },
  {
    id: 'props',
    title: 'Alat Peraga & Reklame Fisik (Props)',
    description: 'Inventaris baliho, spanduk, umbul-umbul, banner, dan signage fisik di jalanan.',
    sampleFileName: 'template_import_props.csv',
    columns: [
      'item_type',
      'project_slug',
      'location_description',
      'quantity',
      'vendor',
      'cost',
      'status',
    ],
    templateCsv: `item_type,project_slug,location_description,quantity,vendor,cost,status
baliho,grand-lestari,Simpang Kayu Besar Lubuk Pakam,1,Cahaya Reklame,2800000,ready
spanduk,grand-sevilla,Jalan Sultan Serdang simpang bandara,4,Karya Printing,480000,installed
umbul_umbul,harmony-hills,Gerbang masuk jalan Patumbak,20,Medan Grafika,600000,printing`,
  },
];

// Zod schemas for row-level validation
export const INVENTORY_ROW_SCHEMA = z.object({
  project_slug: z.string().min(1, 'Slug proyek wajib diisi'),
  snapshot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  belum_terjual: z.coerce.number().int().nonnegative('Jumlah unit belum terjual harus angka >= 0'),
  booking: z.coerce.number().int().nonnegative('Jumlah booking harus angka >= 0'),
  sp3k: z.coerce.number().int().nonnegative('Jumlah SP3K harus angka >= 0'),
  akad_kredit: z.coerce.number().int().nonnegative('Jumlah akad kredit harus angka >= 0'),
  cash_keras: z.coerce.number().int().nonnegative('Jumlah cash keras harus angka >= 0'),
  hold_manajemen: z.coerce.number().int().nonnegative('Jumlah hold manajemen harus angka >= 0'),
});

export const INSIGHTS_ROW_SCHEMA = z.object({
  channel_handle_or_id: z.string().min(1, 'Handle atau ID saluran wajib diisi'),
  period_type: z.enum(['7d', '30d'], {
    message: 'Tipe periode harus "7d" atau "30d"',
  }),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal mulai YYYY-MM-DD'),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal selesai YYYY-MM-DD'),
  metric_key: z.string().min(1, 'Kunci metrik wajib diisi'),
  value: z.coerce.number({ message: 'Nilai metrik harus berupa angka' }),
});

export const ACTIVITIES_ROW_SCHEMA = z.object({
  activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
  pic_name: z.string().min(1, 'Nama PIC wajib diisi'),
  title: z.string().min(3, 'Judul aktivitas minimal 3 karakter'),
  description: z.string().optional(),
  category: z.string().min(1, 'Kategori aktivitas wajib diisi'),
  project_slug: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'done', 'blocked', 'carried_over'], {
    message: 'Status tidak valid (planned, in_progress, done, blocked, carried_over)',
  }),
  duration_minutes: z.coerce.number().int().positive('Durasi harus berupa angka positif').optional().nullable(),
});

export const CONTENT_ROW_SCHEMA = z.object({
  publish_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
  channel_handle: z.string().min(1, 'Handle saluran wajib diisi'),
  title: z.string().min(3, 'Judul konten minimal 3 karakter'),
  pillar: z.string().min(1, 'Pilar konten wajib diisi'),
  format: z.string().min(1, 'Format konten wajib diisi'),
  status: z.enum(['idea', 'in_production', 'review', 'scheduled', 'published', 'cancelled'], {
    message: 'Status tidak valid',
  }),
  pic_name: z.string().min(1, 'Nama PIC wajib diisi'),
});

export const EVENTS_ROW_SCHEMA = z.object({
  title: z.string().min(3, 'Judul event minimal 3 karakter'),
  event_type: z.enum(['weekly', 'monthly', 'special'], {
    message: 'Tipe event harus weekly, monthly, atau special',
  }),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
  location: z.string().min(2, 'Lokasi wajib diisi'),
  project_slug: z.string().optional(),
  budget_planned: z.coerce.number().nonnegative('Budget planned harus angka >= 0'),
  target_visitors: z.coerce.number().int().nonnegative('Target pengunjung harus angka >= 0'),
});

export const PROPS_ROW_SCHEMA = z.object({
  item_type: z.string().min(1, 'Tipe alat peraga wajib diisi'),
  project_slug: z.string().optional(),
  location_description: z.string().min(2, 'Lokasi penempatan wajib diisi'),
  quantity: z.coerce.number().int().positive('Jumlah harus angka positif > 0'),
  vendor: z.string().optional(),
  cost: z.coerce.number().nonnegative('Biaya harus angka >= 0'),
  status: z.string().min(1, 'Status wajib diisi'),
});

export function getValidatorForTarget(target: ImportTarget) {
  switch (target) {
    case 'inventory':
      return INVENTORY_ROW_SCHEMA;
    case 'insights':
      return INSIGHTS_ROW_SCHEMA;
    case 'activities':
      return ACTIVITIES_ROW_SCHEMA;
    case 'content':
      return CONTENT_ROW_SCHEMA;
    case 'events':
      return EVENTS_ROW_SCHEMA;
    case 'props':
      return PROPS_ROW_SCHEMA;
  }
}
