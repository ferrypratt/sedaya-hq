import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { DailyActivity, ActivityCategory, ActivityStatus } from '@/lib/types/database';

const CATEGORY_NAMES: Record<ActivityCategory, string> = {
  content_production: 'Produksi Konten',
  design: 'Desain Grafis',
  social_posting: 'Posting Medsos',
  community_management: 'Balas Chat/DM',
  seo_website: 'SEO & Website',
  google_maps: 'Optimasi G-Maps',
  reporting_monitoring: 'Monitoring & Laporan',
  event: 'Event & Pameran',
  offline_production: 'Produksi Cetak/Baliho',
  sales_support: 'Dukungan Sales/CRO',
  sosialisasi: 'Sosialisasi',
  meeting: 'Rapat Koordinasi',
  research: 'Riset Pasar/Housing',
  other: 'Lainnya',
};

const STATUS_LABELS: Record<ActivityStatus, string> = {
  planned: 'Direncanakan',
  in_progress: 'Sedang Berjalan',
  done: 'Selesai',
  blocked: 'Terkendala',
  carried_over: 'Dialihkan',
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  header: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#000000',
  },
  brandSubtitle: {
    fontSize: 8,
    color: '#6e6a63',
    marginTop: 2,
  },
  tagBadge: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#f9f8f6',
    borderWidth: 0.5,
    borderColor: '#dad4c8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    color: '#2b4be0',
    textTransform: 'uppercase',
  },
  reportHeading: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 6,
    color: '#000000',
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f8f6',
    borderWidth: 0.5,
    borderColor: '#dad4c8',
    borderRadius: 4,
    padding: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7,
    color: '#6e6a63',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#f9f8f6',
    borderWidth: 0.5,
    borderColor: '#dad4c8',
    borderRadius: 4,
    padding: 6,
  },
  kpiLabel: {
    fontSize: 7,
    color: '#6e6a63',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#dad4c8',
    paddingBottom: 3,
    marginBottom: 6,
  },
  table: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#dad4c8',
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9f8f6',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  th: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: '#000000',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dad4c8',
    paddingVertical: 5,
    paddingHorizontal: 4,
    minHeight: 22,
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  td: {
    fontSize: 7.5,
    color: '#222222',
    lineHeight: 1.3,
  },
  colNo: { width: '4%' },
  colDate: { width: '11%' },
  colPic: { width: '13%' },
  colCategory: { width: '14%' },
  colProject: { width: '13%' },
  colTask: { width: '31%' },
  colStatus: { width: '14%' },

  badgeStatus: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
    textAlign: 'center',
    alignSelf: 'flex-start',
  },
  statusDone: {
    backgroundColor: '#eaf5f0',
    color: '#02693e',
  },
  statusInProgress: {
    backgroundColor: '#ffffff',
    color: '#2b4be0',
    borderWidth: 0.5,
    borderColor: '#2b4be0',
  },
  statusPlanned: {
    backgroundColor: '#f9f8f6',
    color: '#6e6a63',
  },
  statusBlocked: {
    backgroundColor: '#fdf3ee',
    color: '#c2410c',
  },
  statusCarried: {
    backgroundColor: '#000000',
    color: '#ffffff',
  },

  signatureSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '40%',
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 7.5,
    color: '#6e6a63',
    marginBottom: 40,
  },
  signatureName: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    borderTopWidth: 0.5,
    borderTopColor: '#000000',
    paddingTop: 4,
    color: '#000000',
  },
  signatureOrg: {
    fontSize: 7,
    color: '#6e6a63',
    marginTop: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#6e6a63',
    borderTopWidth: 0.5,
    borderTopColor: '#dad4c8',
    paddingTop: 5,
  },
});

export interface ActivitiesPdfDocumentProps {
  activities: DailyActivity[];
  dateTitle: string;
  picName: string;
  generatedBy?: string;
}

export function ActivitiesPdfDocument({
  activities,
  dateTitle,
  picName,
  generatedBy = 'Ferry Pratama (Supervisor)',
}: ActivitiesPdfDocumentProps) {
  const totalActivities = activities.length;
  const totalMinutes = activities.reduce((acc, a) => acc + (a.duration_minutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const doneCount = activities.filter((a) => a.status === 'done').length;
  const inProgressCount = activities.filter((a) => a.status === 'in_progress').length;
  const blockedCount = activities.filter((a) => a.status === 'blocked').length;

  const nowFormatted = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const getStatusBadgeStyle = (status: ActivityStatus) => {
    switch (status) {
      case 'done':
        return styles.statusDone;
      case 'in_progress':
        return styles.statusInProgress;
      case 'blocked':
        return styles.statusBlocked;
      case 'carried_over':
        return styles.statusCarried;
      default:
        return styles.statusPlanned;
    }
  };

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Brand & Document Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.brandTitle}>PT Sedaya Property</Text>
              <Text style={styles.brandSubtitle}>
                Divisi Branding, Marketing & Riset | Medan & Deli Serdang
              </Text>
            </View>
            <Text style={styles.tagBadge}>Laporan Resmi Operasional</Text>
          </View>
          <Text style={styles.reportHeading}>
            LOG HARIAN AKTIVITAS PEMASARAN TIM
          </Text>
        </View>

        {/* Metadata Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Periode / Tanggal</Text>
            <Text style={styles.metaValue}>{dateTitle}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Filter Petugas (PIC)</Text>
            <Text style={styles.metaValue}>{picName}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Dibuat Pada</Text>
            <Text style={styles.metaValue}>{nowFormatted}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Otorisasi</Text>
            <Text style={styles.metaValue}>{generatedBy}</Text>
          </View>
        </View>

        {/* KPI Summary Cards */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Aktivitas</Text>
            <Text style={styles.kpiValue}>{totalActivities} Item</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Alokasi Waktu</Text>
            <Text style={styles.kpiValue}>{totalHours} Jam</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Tuntas (Selesai)</Text>
            <Text style={[styles.kpiValue, { color: '#02693e' }]}>
              {doneCount} Item
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Berjalan / Kendala</Text>
            <Text style={[styles.kpiValue, { color: blockedCount > 0 ? '#c2410c' : '#2b4be0' }]}>
              {inProgressCount} / {blockedCount} Item
            </Text>
          </View>
        </View>

        {/* Table Title */}
        <Text style={styles.sectionTitle}>
          Rincian Aktivitas Harian ({activities.length} Baris)
        </Text>

        {/* Activities Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colNo]}>No</Text>
            <Text style={[styles.th, styles.colDate]}>Tanggal</Text>
            <Text style={[styles.th, styles.colPic]}>PIC</Text>
            <Text style={[styles.th, styles.colCategory]}>Kategori</Text>
            <Text style={[styles.th, styles.colProject]}>Proyek</Text>
            <Text style={[styles.th, styles.colTask]}>Deskripsi & Catatan Leader</Text>
            <Text style={[styles.th, styles.colStatus]}>Status</Text>
          </View>

          {activities.length === 0 ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#6e6a63', fontSize: 8 }}>
                Tidak ada data aktivitas yang sesuai dengan filter yang dipilih.
              </Text>
            </View>
          ) : (
            activities.map((act, idx) => (
              <View
                key={act.id || idx}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowEven : {},
                ]}
              >
                <Text style={[styles.td, styles.colNo]}>{idx + 1}</Text>
                <Text style={[styles.td, styles.colDate]}>
                  {act.activity_date}
                  {act.duration_minutes ? `\n(${act.duration_minutes}m)` : ''}
                </Text>
                <Text style={[styles.td, styles.colPic]}>
                  {act.pic?.full_name || 'Petugas'}
                </Text>
                <Text style={[styles.td, styles.colCategory]}>
                  {CATEGORY_NAMES[act.category] || act.category}
                </Text>
                <Text style={[styles.td, styles.colProject]}>
                  {act.project?.name || 'Umum / HQ'}
                </Text>
                <View style={[styles.td, styles.colTask]}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', color: '#000000' }}>
                    {act.title}
                  </Text>
                  {act.description ? (
                    <Text style={{ color: '#555555', marginTop: 1 }}>
                      {act.description}
                    </Text>
                  ) : null}
                  {act.leader_note ? (
                    <Text style={{ color: '#2b4be0', marginTop: 1, fontFamily: 'Helvetica-Bold' }}>
                      Catatan Leader: {act.leader_note}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.colStatus}>
                  <Text
                    style={[
                      styles.badgeStatus,
                      getStatusBadgeStyle(act.status),
                    ]}
                  >
                    {STATUS_LABELS[act.status] || act.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Formal Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureRole}>Petugas Pelaksana (PIC)</Text>
            <Text style={styles.signatureName}>
              {picName === 'Semua PIC' ? '( Seluruh Anggota Tim )' : picName}
            </Text>
            <Text style={styles.signatureOrg}>Tim Operasional Marketing</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureRole}>
              Mengetahui / Mengesahkan
            </Text>
            <Text style={styles.signatureName}>Ferry Pratama</Text>
            <Text style={styles.signatureOrg}>
              Supervisor Marketing & Riset
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Dokumen internal resmi PT Sedaya Property | Dicetak otomatis dari Sedaya HQ
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} dari ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
