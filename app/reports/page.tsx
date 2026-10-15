'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentWeekRange } from '@/lib/utils/date-utils';
import {
  INITIAL_PROJECTS,
  INITIAL_UNIT_SNAPSHOTS,
  INITIAL_ACTIVITIES,
} from '@/lib/data/seed-data';
import {
  INITIAL_MARKETING_PLANS,
  INITIAL_CONTENT_ITEMS,
} from '@/lib/data/seed-plans-content';
import { INITIAL_CHANNEL_INSIGHTS } from '@/lib/data/seed-channels';
import { ReportDocument, ReportSections } from '@/components/modules/reports/report-document';
import { pdf } from '@react-pdf/renderer';
import {
  FileText,
  CheckSquare,
  Square,
  RefreshCw,
  Eye,
  History,
  FileDown,
} from 'lucide-react';

interface ReportRunLog {
  id: string;
  report_type: 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  generated_by: string;
  created_at: string;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [periodStart, setPeriodStart] = useState('2026-10-12');
  const [periodEnd, setPeriodEnd] = useState('2026-10-18');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const { start, end } = getCurrentWeekRange();
    setPeriodStart(start);
    setPeriodEnd(end);
  }, []);

  const handleSetCurrentWeek = () => {
    setReportType('weekly');
    const { start, end } = getCurrentWeekRange();
    setPeriodStart(start);
    setPeriodEnd(end);
  };

  const handleSetCurrentMonth = () => {
    setReportType('monthly');
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    setPeriodStart(`${y}-${m}-01`);
    setPeriodEnd(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
  };

  const [sections, setSections] = useState<ReportSections>({
    executiveSummary: true,
    inventoryFunnel: true,
    dailyActivities: true,
    marketingPlan: true,
    contentEditorial: true,
    channelInsights: true,
    offlineMarketing: true,
  });

  const [reportRuns, setReportRuns] = useState<ReportRunLog[]>([]);

  const toggleSection = (key: keyof ReportSections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      const doc = (
        <ReportDocument
          reportType={reportType}
          periodStart={periodStart}
          periodEnd={periodEnd}
          generatedBy="Ferry Pratama (Leader)"
          sections={sections}
          projects={INITIAL_PROJECTS}
          snapshots={INITIAL_UNIT_SNAPSHOTS}
          activities={INITIAL_ACTIVITIES}
          plan={INITIAL_MARKETING_PLANS[0]}
          contentItems={INITIAL_CONTENT_ITEMS}
          insights={INITIAL_CHANNEL_INSIGHTS}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);

      const newRun: ReportRunLog = {
        id: `rep-log-${Date.now()}`,
        report_type: reportType,
        period_start: periodStart,
        period_end: periodEnd,
        generated_by: 'Ferry Pratama',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setReportRuns([newRun, ...reportRuns]);
    } catch (err) {
      alert(`Gagal membuat PDF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <PageHeader
          eyebrow="Dokumen Resmi • Generator Laporan A4"
          title="Laporan Operasional Pemasaran"
          description="Hasilkan laporan operasional format PDF berstandar cetak A4 portrait secara instan untuk manajemen & perbankan BTN."
          actions={
            pdfBlobUrl ? (
              <a
                href={pdfBlobUrl}
                download={`Laporan_${reportType}_Sedaya_${periodStart}_sd_${periodEnd}.pdf`}
                className="btn-pill-primary text-xs bg-violet-pulse"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Unduh Dokumen PDF (.pdf)</span>
              </a>
            ) : undefined
          }
        />

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Card */}
          <div className="lg:col-span-4 card-clay p-5 space-y-5">
            <div>
              <h2 className="text-xs font-extrabold text-ink-black uppercase tracking-wider mb-2.5">
                1. Tipe & Periode Laporan
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setReportType('weekly')}
                  className={`min-h-10 text-xs font-bold rounded-xl border transition-colors ${
                    reportType === 'weekly'
                      ? 'bg-ink-black text-paper-white border-ink-black'
                      : 'bg-warm-cream text-stone-gray hover:text-ink-black border-sand-border'
                  }`}
                >
                  Mingguan (Weekly)
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('monthly')}
                  className={`min-h-10 text-xs font-bold rounded-xl border transition-colors ${
                    reportType === 'monthly'
                      ? 'bg-ink-black text-paper-white border-ink-black'
                      : 'bg-warm-cream text-stone-gray hover:text-ink-black border-sand-border'
                  }`}
                >
                  Bulanan (Monthly)
                </button>
              </div>

              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="text-[10px] font-bold text-stone-gray uppercase tracking-wider">Pintas:</span>
                <button
                  type="button"
                  onClick={handleSetCurrentWeek}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-full border border-sand-border bg-paper-white text-ink-black hover:bg-warm-cream transition-colors"
                >
                  Minggu Ini
                </button>
                <button
                  type="button"
                  onClick={handleSetCurrentMonth}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-full border border-sand-border bg-paper-white text-ink-black hover:bg-warm-cream transition-colors"
                >
                  Bulan Ini
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-gray uppercase tracking-wider mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="input-clay text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-gray uppercase tracking-wider mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="input-clay text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section Toggles */}
            <div>
              <h2 className="text-xs font-extrabold text-ink-black uppercase tracking-wider mb-2.5">
                2. Pilih Bagian Laporan
              </h2>
              <div className="space-y-2">
                {[
                  { key: 'executiveSummary', label: 'Ringkasan Eksekutif Pemasaran' },
                  { key: 'inventoryFunnel', label: 'Posisi Stok & Funnel Unit Proyek' },
                  { key: 'dailyActivities', label: 'Log Realisasi Aktivitas Tim' },
                  { key: 'marketingPlan', label: 'Rencana Kerja & Evaluasi Target' },
                  { key: 'contentEditorial', label: 'Jadwal Konten Media Sosial' },
                  { key: 'channelInsights', label: 'Highlight Metrik Saluran Digital' },
                  { key: 'offlineMarketing', label: 'Pemasaran Offline & Reklame' },
                ].map((sec) => {
                  const isChecked = sections[sec.key as keyof ReportSections];
                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => toggleSection(sec.key as keyof ReportSections)}
                      className="w-full flex items-center justify-between px-3.5 min-h-10 rounded-xl bg-warm-cream border border-sand-border text-left hover:border-ink-black transition-colors"
                    >
                      <span className="text-xs font-bold text-ink-black">{sec.label}</span>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-ink-black shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-ash-gray shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={isGenerating}
                className="w-full btn-pill-primary text-xs justify-center disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-paper-white" />
                    <span>Menyusun Dokumen PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Dokumen PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PDF Preview Area */}
          <div className="lg:col-span-8 card-clay p-5 flex flex-col justify-between min-h-[520px]">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-pulse" />
                <h3 className="text-sm font-extrabold text-ink-black">
                  Pratinjau Dokumen (A4 Portrait)
                </h3>
              </div>
              {pdfBlobUrl && (
                <span className="text-xs font-bold text-forest-emerald bg-forest-surface px-2.5 py-0.5 rounded-full border border-forest-emerald/30">
                  PDF Tergenerate
                </span>
              )}
            </div>

            {pdfBlobUrl ? (
              <div className="flex-1 w-full border border-sand-border rounded-xl overflow-hidden min-h-[480px]">
                <iframe
                  src={pdfBlobUrl}
                  title="PDF Preview"
                  className="w-full h-full min-h-[480px] bg-warm-cream"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-gray bg-warm-cream rounded-xl border border-dashed border-sand-border">
                <FileText className="w-10 h-10 text-ash-gray mb-3" />
                <p className="text-sm font-extrabold text-ink-black">Belum Ada Pratinjau PDF</p>
                <p className="text-xs text-stone-gray mt-1 max-w-sm">
                  Pilih tipe periode dan centang bagian laporan di sisi kiri, kemudian klik tombol <strong>Generate Dokumen PDF</strong>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log / History of Report Runs */}
        <div className="card-clay p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-violet-pulse" />
              <h3 className="text-sm font-extrabold text-ink-black">
                Riwayat Pembuatan Laporan (Log report_runs)
              </h3>
            </div>
            <span className="text-xs font-bold metric-mono px-2.5 py-0.5 rounded-full bg-warm-cream border border-sand-border text-ink-black">
              {reportRuns.length} Tercatat
            </span>
          </div>

          {reportRuns.length === 0 ? (
            <div className="p-6 rounded-xl bg-warm-cream border border-sand-border text-center text-xs text-stone-gray">
              Belum ada riwayat pembuatan dokumen PDF pada sesi ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-sand-border text-stone-gray uppercase tracking-wider bg-warm-cream">
                    <th className="py-2.5 px-3 font-bold">Waktu Pembuatan</th>
                    <th className="py-2.5 px-3 font-bold">Tipe Laporan</th>
                    <th className="py-2.5 px-3 font-bold">Rentang Periode</th>
                    <th className="py-2.5 px-3 font-bold">Dibuat Oleh</th>
                    <th className="py-2.5 px-3 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/70">
                  {reportRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-warm-cream/40 transition-colors">
                      <td className="py-2.5 px-3 metric-mono text-stone-gray">{run.created_at}</td>
                      <td className="py-2.5 px-3 font-extrabold text-ink-black uppercase">{run.report_type}</td>
                      <td className="py-2.5 px-3 text-ink-black metric-mono">
                        {run.period_start} s/d {run.period_end}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-ink-black">{run.generated_by}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest-surface text-forest-emerald border border-forest-emerald/30">
                          Generated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

