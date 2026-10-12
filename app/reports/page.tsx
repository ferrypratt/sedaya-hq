'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
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

  const [sections, setSections] = useState<ReportSections>({
    executiveSummary: true,
    inventoryFunnel: true,
    dailyActivities: true,
    marketingPlan: true,
    contentEditorial: true,
    channelInsights: true,
    offlineMarketing: true,
  });

  const [reportRuns, setReportRuns] = useState<ReportRunLog[]>([
    {
      id: 'rep-log-1',
      report_type: 'weekly',
      period_start: '2026-10-05',
      period_end: '2026-10-11',
      generated_by: 'Ferry Pratama',
      created_at: '2026-10-12 09:15:00',
    },
  ]);

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
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ink-black text-paper-white">
                Dokumen Resmi
              </span>
              <span className="text-xs text-stone-gray font-medium">
                Generator Laporan A4
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-black">
              Laporan Operasional Pemasaran
            </h1>
            <p className="text-sm text-stone-gray mt-1">
              Hasilkan laporan operasional format PDF berstandar cetak A4 portrait secara instan untuk manajemen & perbankan BTN.
            </p>
          </div>

          {pdfBlobUrl && (
            <a
              href={pdfBlobUrl}
              download={`Laporan_${reportType}_Sedaya_${periodStart}_sd_${periodEnd}.pdf`}
              className="px-4 py-2 text-xs font-bold text-paper-white bg-violet-pulse rounded-full hover:bg-blue-700 transition-colors shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Dokumen PDF (.pdf)</span>
            </a>
          )}
        </div>

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Card */}
          <div className="lg:col-span-1 bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-extrabold text-ink-black uppercase tracking-wider mb-2">
                1. Tipe & Periode Laporan
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setReportType('weekly')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    reportType === 'weekly'
                      ? 'bg-ink-black text-paper-white border-ink-black shadow-xs'
                      : 'bg-warm-cream text-stone-gray hover:text-ink-black border-sand-border'
                  }`}
                >
                  Mingguan (Weekly)
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('monthly')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    reportType === 'monthly'
                      ? 'bg-ink-black text-paper-white border-ink-black shadow-xs'
                      : 'bg-warm-cream text-stone-gray hover:text-ink-black border-sand-border'
                  }`}
                >
                  Bulanan (Monthly)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-gray mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-2.5 py-1.5 text-ink-black focus:ring-1 focus:ring-ink-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-gray mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-2.5 py-1.5 text-ink-black focus:ring-1 focus:ring-ink-black"
                  />
                </div>
              </div>
            </div>

            {/* Section Toggles */}
            <div>
              <h2 className="text-sm font-extrabold text-ink-black uppercase tracking-wider mb-2">
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
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-warm-cream/50 border border-sand-border text-left hover:bg-warm-cream transition-colors"
                    >
                      <span className="text-xs font-semibold text-ink-black">{sec.label}</span>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-ink-black" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-300" />
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
                className="w-full py-2.5 px-4 text-xs font-bold text-paper-white bg-ink-black hover:bg-stone-800 disabled:bg-stone-400 rounded-full transition-colors shadow-xs flex items-center justify-center gap-2"
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
          <div className="lg:col-span-2 bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[500px]">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-pulse" />
                <h3 className="text-sm font-extrabold text-ink-black">
                  Pratinjau Dokumen (A4 Portrait)
                </h3>
              </div>
              {pdfBlobUrl && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  PDF Tergenerate
                </span>
              )}
            </div>

            {pdfBlobUrl ? (
              <div className="flex-1 w-full border border-sand-border rounded-xl overflow-hidden min-h-[480px]">
                <iframe
                  src={pdfBlobUrl}
                  title="PDF Preview"
                  className="w-full h-full min-h-[480px] bg-stone-100"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-gray bg-warm-cream/30 rounded-xl border border-dashed border-sand-border">
                <FileText className="w-12 h-12 text-stone-300 mb-2" />
                <p className="text-sm font-bold text-ink-black">Belum ada pratinjau PDF</p>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Pilih tipe periode dan centang bagian laporan di sisi kiri, kemudian klik tombol <strong>Generate Dokumen PDF</strong>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log / History of Report Runs */}
        <div className="bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-violet-pulse" />
              <h3 className="text-sm font-extrabold text-ink-black">
                Riwayat Pembuatan Laporan (Log report_runs)
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warm-cream border border-sand-border text-ink-black">
              {reportRuns.length} Tercatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sand-border text-stone-gray uppercase tracking-wider bg-warm-cream/50">
                  <th className="py-2.5 px-3 font-semibold">Waktu Pembuatan</th>
                  <th className="py-2.5 px-3 font-semibold">Tipe Laporan</th>
                  <th className="py-2.5 px-3 font-semibold">Rentang Periode</th>
                  <th className="py-2.5 px-3 font-semibold">Dibuat Oleh</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-border/70">
                {reportRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-warm-cream/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-stone-gray">{run.created_at}</td>
                    <td className="py-2.5 px-3 font-bold text-ink-black uppercase">{run.report_type}</td>
                    <td className="py-2.5 px-3 text-ink-black">
                      {run.period_start} s/d {run.period_end}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-ink-black">{run.generated_by}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Generated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
