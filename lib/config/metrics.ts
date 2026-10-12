import { ChannelPlatform } from '@/lib/types/database';

export interface MetricDefinition {
  key: string;
  label: string;
  shortLabel?: string;
  unit?: string;
  description: string;
  isInteger: boolean;
}

export const PLATFORM_METRICS: Record<ChannelPlatform, MetricDefinition[]> = {
  instagram: [
    {
      key: 'followers',
      label: 'Total Pengikut',
      shortLabel: 'Followers',
      description: 'Jumlah total pengikut akun Instagram saat ini',
      isInteger: true,
    },
    {
      key: 'followers_gained',
      label: 'Pertumbuhan Pengikut',
      shortLabel: '+Followers',
      description: 'Penambahan pengikut bersih selama periode',
      isInteger: true,
    },
    {
      key: 'reach',
      label: 'Jangkauan Akun (Reach)',
      shortLabel: 'Reach',
      description: 'Jumlah akun unik yang melihat konten',
      isInteger: true,
    },
    {
      key: 'views',
      label: 'Total Tayangan (Views/Impressions)',
      shortLabel: 'Views',
      description: 'Total frekuensi konten dilihat secara keseluruhan',
      isInteger: true,
    },
    {
      key: 'profile_visits',
      label: 'Kunjungan Profil',
      shortLabel: 'Profil Visit',
      description: 'Jumlah kunjungan ke halaman profil akun',
      isInteger: true,
    },
    {
      key: 'link_clicks',
      label: 'Klik Tautan Bio',
      shortLabel: 'Link Clicks',
      description: 'Klik pada tautan bio (website/WhatsApp lead)',
      isInteger: true,
    },
    {
      key: 'interactions',
      label: 'Total Interaksi',
      shortLabel: 'Interactions',
      description: 'Total suka, komentar, simpan, dan bagikan',
      isInteger: true,
    },
    {
      key: 'posts_published',
      label: 'Konten Diterbitkan',
      shortLabel: 'Posts',
      description: 'Jumlah konten reels, feed, & carousel yang diunggah',
      isInteger: true,
    },
  ],
  website: [
    {
      key: 'sessions',
      label: 'Sesi Kunjungan',
      shortLabel: 'Sessions',
      description: 'Total sesi kunjungan pengguna di website portal',
      isInteger: true,
    },
    {
      key: 'users',
      label: 'Pengguna Unik (Users)',
      shortLabel: 'Users',
      description: 'Jumlah pengunjung unik yang mengakses website',
      isInteger: true,
    },
    {
      key: 'pageviews',
      label: 'Tampilan Halaman (Pageviews)',
      shortLabel: 'Pageviews',
      description: 'Total halaman yang dimuat oleh pengunjung',
      isInteger: true,
    },
    {
      key: 'avg_engagement_time_sec',
      label: 'Rata-rata Waktu Kunjungan (Detik)',
      shortLabel: 'Durasi Rata-rata',
      unit: 'detik',
      description: 'Rata-rata durasi keaktifan pengunjung di halaman',
      isInteger: false,
    },
    {
      key: 'whatsapp_clicks',
      label: 'Klik Tombol WhatsApp CRO',
      shortLabel: 'WA Clicks',
      description: 'Konversi klik langsung ke nomor WhatsApp sales/CRO',
      isInteger: true,
    },
  ],
  google_maps: [
    {
      key: 'profile_views',
      label: 'Tayangan Profil Bisnis (Views)',
      shortLabel: 'Views',
      description: 'Frekuensi profil Google Business Profile dilihat',
      isInteger: true,
    },
    {
      key: 'searches',
      label: 'Penelusuran Pencarian (Searches)',
      shortLabel: 'Searches',
      description: 'Pencarian langsung maupun penemuan kategori lokasi',
      isInteger: true,
    },
    {
      key: 'calls',
      label: 'Panggilan Telepon (Calls)',
      shortLabel: 'Calls',
      description: 'Klik tombol hubungi via telepon dari Google Maps',
      isInteger: true,
    },
    {
      key: 'direction_requests',
      label: 'Permintaan Rute (Directions)',
      shortLabel: 'Rute',
      description: 'Pengguna yang meminta navigasi rute ke lokasi kantor/proyek',
      isInteger: true,
    },
    {
      key: 'website_clicks',
      label: 'Klik Situs Web',
      shortLabel: 'Web Clicks',
      description: 'Klik navigasi menuju website resmi dari Maps',
      isInteger: true,
    },
  ],
  youtube: [
    {
      key: 'views',
      label: 'Total Tayangan Video (Views)',
      shortLabel: 'Views',
      description: 'Total penayangan video panjang dan YouTube Shorts',
      isInteger: true,
    },
    {
      key: 'watch_time_hours',
      label: 'Waktu Tonton (Jam)',
      shortLabel: 'Watch Time',
      unit: 'jam',
      description: 'Akumulasi waktu tonton video oleh penonton',
      isInteger: false,
    },
    {
      key: 'subscribers_gained',
      label: 'Pelanggan Baru (Subscribers)',
      shortLabel: '+Subs',
      description: 'Penambahan subscriber baru kanal YouTube',
      isInteger: true,
    },
    {
      key: 'impressions',
      label: 'Tayangan Impresi Thumbnail',
      shortLabel: 'Impresi',
      description: 'Frekuensi thumbnail video ditampilkan kepada pemirsa',
      isInteger: true,
    },
  ],
  tiktok: [
    {
      key: 'video_views',
      label: 'Tayangan Video (Views)',
      shortLabel: 'Views',
      description: 'Total penayangan video TikTok di For You Page & Profil',
      isInteger: true,
    },
    {
      key: 'profile_views',
      label: 'Kunjungan Profil Akun',
      shortLabel: 'Profil Visit',
      description: 'Jumlah pengguna yang membuka halaman profil TikTok',
      isInteger: true,
    },
    {
      key: 'likes',
      label: 'Total Suka (Likes)',
      shortLabel: 'Likes',
      description: 'Jumlah tanda suka yang diterima pada konten video',
      isInteger: true,
    },
    {
      key: 'comments',
      label: 'Komentar Pengguna',
      shortLabel: 'Comments',
      description: 'Jumlah komentar dari audiens pada video',
      isInteger: true,
    },
    {
      key: 'shares',
      label: 'Dibagikan (Shares)',
      shortLabel: 'Shares',
      description: 'Frekuensi video disebarkan ke platform lain',
      isInteger: true,
    },
    {
      key: 'followers_gained',
      label: 'Pengikut Baru (Followers)',
      shortLabel: '+Followers',
      description: 'Pertumbuhan pengikut akun TikTok',
      isInteger: true,
    },
  ],
};

export function getPlatformMetrics(platform: ChannelPlatform): MetricDefinition[] {
  return PLATFORM_METRICS[platform] || [];
}

export function getMetricDefinition(platform: ChannelPlatform, metricKey: string): MetricDefinition | undefined {
  return PLATFORM_METRICS[platform]?.find((m) => m.key === metricKey);
}

export function formatMetricValue(value: number, definition?: MetricDefinition): string {
  if (definition?.unit === 'detik') {
    const mins = Math.floor(value / 60);
    const secs = Math.round(value % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }
  if (definition?.unit === 'jam') {
    return `${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jam`;
  }
  return value.toLocaleString('id-ID');
}
