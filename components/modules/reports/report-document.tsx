import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { Project, UnitSnapshot, DailyActivity, MarketingPlan, ContentItem, ChannelInsight } from '@/lib/types/database';

export interface ReportSections {
  executiveSummary: boolean;
  inventoryFunnel: boolean;
  dailyActivities: boolean;
  marketingPlan: boolean;
  contentEditorial: boolean;
  channelInsights: boolean;
  offlineMarketing: boolean;
}

export interface ReportDocumentProps {
  reportType: 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  generatedBy: string;
  sections: ReportSections;
  projects: Project[];
  snapshots: Record<string, UnitSnapshot[]>;
  activities: DailyActivity[];
  plan: MarketingPlan & { items?: unknown[] };
  contentItems: ContentItem[];
  insights: ChannelInsight[];
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  brandName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reportTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginTop: 3,
    color: '#3859f9',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    fontSize: 8,
    color: '#555555',
  },
  section: {
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#dad4c8',
    borderBottomStyle: 'solid',
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: '#222222',
    marginBottom: 6,
  },
  table: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#dad4c8',
    borderStyle: 'solid',
    marginTop: 4,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dad4c8',
    borderBottomStyle: 'solid',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f9f8f6',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  col1: { width: '30%' },
  col2: { width: '14%', textAlign: 'right' },
  col3: { width: '14%', textAlign: 'right' },
  col4: { width: '14%', textAlign: 'right' },
  col5: { width: '14%', textAlign: 'right' },
  col6: { width: '14%', textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: '#dad4c8',
    borderTopStyle: 'solid',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: '#777777',
  },
  badgeWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
  },
});

export function ReportDocument({
  reportType,
  periodStart,
  periodEnd,
  generatedBy,
  sections,
  projects,
  snapshots,
  activities,
  plan,
  contentItems,
}: ReportDocumentProps) {
  const activeHousing = projects.filter((p) => p.kind === 'active_project');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>PT Sedaya Property</Text>
          <Text style={styles.reportTitle}>
            Laporan Operasional Divisi Branding, Marketing & Research ({reportType === 'weekly' ? 'Mingguan' : 'Bulanan'})
          </Text>
          <View style={styles.metaRow}>
            <Text>Periode: {periodStart} s/d {periodEnd}</Text>
            <Text>Dibuat oleh: {generatedBy}</Text>
            <Text>Zona Waktu: Asia/Jakarta</Text>
          </View>
        </View>

        {/* Section 1: Executive Summary */}
        {sections.executiveSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Ringkasan Eksekutif</Text>
            <Text style={styles.paragraph}>
              Laporan ini merangkum perkembangan posisi stok unit perumahan subsidi, realisasi pengerjaan aktivitas tim pemasaran, pencapaian target mingguan, distribusi konten media sosial, dan penyerapan sarana promosi offline di wilayah Medan & Deli Serdang. Seluruh data telah diverifikasi sesuai regulasi perbankan KPR BTN dan operasional internal Sedaya Property.
            </Text>
          </View>
        )}

        {/* Section 2: Inventory Funnel per Project */}
        {sections.inventoryFunnel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Posisi Stok Unit & Funnel KPR Perumahan</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.col1}>Proyek</Text>
                <Text style={styles.col2}>Belum Jual</Text>
                <Text style={styles.col3}>Booking</Text>
                <Text style={styles.col4}>SP3K</Text>
                <Text style={styles.col5}>Akad</Text>
                <Text style={styles.col6}>Total/Alokasi</Text>
              </View>
              {activeHousing.map((p) => {
                const s = snapshots[p.id]?.[0];
                const sum = s
                  ? s.belum_terjual + s.booking + s.sp3k + s.akad_kredit + s.cash_keras + s.hold_manajemen
                  : 0;
                const unallocated = p.total_units - sum;

                return (
                  <View key={p.id} style={styles.tableRow}>
                    <Text style={styles.col1}>
                      {p.name} {unallocated !== 0 ? `(*Unallocated ${unallocated})` : ''}
                    </Text>
                    <Text style={styles.col2}>{s?.belum_terjual ?? 0}</Text>
                    <Text style={styles.col3}>{s?.booking ?? 0}</Text>
                    <Text style={styles.col4}>{s?.sp3k ?? 0}</Text>
                    <Text style={styles.col5}>{s?.akad_kredit ?? 0}</Text>
                    <Text style={styles.col6}>{sum} / {p.total_units}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={{ fontSize: 7.5, color: '#888888', fontStyle: 'italic' }}>
              *Catatan: Samudera Residence memiliki 3 unit unallocated (total 61 unit, tercatat 58 unit) dalam proses rekonsiliasi.
            </Text>
          </View>
        )}

        {/* Section 3: Activities */}
        {sections.dailyActivities && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Realisasi Aktivitas Tim Operasional</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={{ width: '15%' }}>Tanggal</Text>
                <Text style={{ width: '20%' }}>PIC</Text>
                <Text style={{ width: '45%' }}>Uraian Aktivitas</Text>
                <Text style={{ width: '20%', textAlign: 'right' }}>Status</Text>
              </View>
              {activities.slice(0, 6).map((a) => (
                <View key={a.id} style={styles.tableRow}>
                  <Text style={{ width: '15%' }}>{a.activity_date}</Text>
                  <Text style={{ width: '20%' }}>{a.pic?.full_name}</Text>
                  <Text style={{ width: '45%' }}>{a.title}</Text>
                  <Text style={{ width: '20%', textAlign: 'right' }}>{a.status.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Section 4: Marketing Plan Progress */}
        {sections.marketingPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Rencana Kerja Pemasaran Periode Ini</Text>
            <Text style={styles.paragraph}>
              Fokus: {plan?.title}
            </Text>
            <Text style={{ fontSize: 8, color: '#444444', marginBottom: 4 }}>
              Objektif: {plan?.objective}
            </Text>
          </View>
        )}

        {/* Section 5: Content Editorial Schedule */}
        {sections.contentEditorial && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Rencana Publikasi Konten Editorial</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={{ width: '15%' }}>Tanggal</Text>
                <Text style={{ width: '15%' }}>Format</Text>
                <Text style={{ width: '50%' }}>Judul Konten</Text>
                <Text style={{ width: '20%', textAlign: 'right' }}>Status</Text>
              </View>
              {contentItems.slice(0, 5).map((c) => (
                <View key={c.id} style={styles.tableRow}>
                  <Text style={{ width: '15%' }}>{c.publish_date}</Text>
                  <Text style={{ width: '15%' }}>{c.format.toUpperCase()}</Text>
                  <Text style={{ width: '50%' }}>{c.title}</Text>
                  <Text style={{ width: '20%', textAlign: 'right' }}>{c.status.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>PT Sedaya Property • Internal Confidential Document</Text>
          <Text>Halaman 1 dari 1</Text>
        </View>
      </Page>
    </Document>
  );
}
