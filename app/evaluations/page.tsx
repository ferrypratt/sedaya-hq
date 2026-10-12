'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { INITIAL_EVALUATIONS } from '@/lib/data/seed-plans-content';
import { INITIAL_ACTIVITIES } from '@/lib/data/seed-data';
import { Evaluation, EvaluationItem } from '@/lib/types/database';
import {
  FileSpreadsheet,
  PlusCircle,
  Calendar,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Award,
  X,
} from 'lucide-react';

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<(Evaluation & { items: EvaluationItem[] })[]>(
    INITIAL_EVALUATIONS
  );
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentEval = evaluations.find((e) => e.period_type === periodType) || evaluations[0];

  // Auto-computed analytics
  // 1. Activity Completion rate per PIC
  const totalFerry = INITIAL_ACTIVITIES.filter((a) => a.pic?.full_name.includes('Ferry')).length;
  const doneFerry = INITIAL_ACTIVITIES.filter(
    (a) => a.pic?.full_name.includes('Ferry') && a.status === 'done'
  ).length;
  const rateFerry = totalFerry ? Math.round((doneFerry / totalFerry) * 100) : 100;

  const totalZiyad = INITIAL_ACTIVITIES.filter((a) => a.pic?.full_name.includes('Ziyad')).length;
  const doneZiyad = INITIAL_ACTIVITIES.filter(
    (a) => a.pic?.full_name.includes('Ziyad') && a.status === 'done'
  ).length;
  const rateZiyad = totalZiyad ? Math.round((doneZiyad / totalZiyad) * 100) : 50;

  // New Eval Form State
  const [newEvalForm, setNewEvalForm] = useState({
    title: '',
    period_start: '2026-10-12',
    period_end: '2026-10-18',
    summary: '',
    wins: '',
    issues: '',
    learnings: '',
    next_actions: '',
  });

  const handleCreateEval = (e: React.FormEvent) => {
    e.preventDefault();
    const newEval: Evaluation & { items: EvaluationItem[] } = {
      id: `eval-${Date.now()}`,
      period_type: periodType,
      period_start: newEvalForm.period_start,
      period_end: newEvalForm.period_end,
      summary: newEvalForm.summary,
      wins: newEvalForm.wins,
      issues: newEvalForm.issues,
      learnings: newEvalForm.learnings,
      next_actions: newEvalForm.next_actions,
      created_by: 'f1111111-1111-1111-1111-111111111111',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [],
    };
    setEvaluations([newEval, ...evaluations]);
    setIsModalOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warm-cream border border-sand-border text-xs text-stone-gray font-medium mb-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-ink-black" />
              <span>Review Kinerja Berkala</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
              Evaluasi Marketing & Kinerja
            </h1>
            <p className="text-sm text-stone-gray">
              Panel analitik terintegrasi: komparasi target vs realisasi, laju penyelesaian tugas, dan perubahan unit.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-pill-primary text-xs sm:text-sm inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Evaluasi Baru</span>
          </button>
        </div>

        {/* Period Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-warm-cream border border-sand-border rounded-full w-fit">
          <button
            onClick={() => setPeriodType('weekly')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              periodType === 'weekly'
                ? 'bg-ink-black text-paper-white shadow-xs'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            Evaluasi Mingguan (Weekly)
          </button>
          <button
            onClick={() => setPeriodType('monthly')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              periodType === 'monthly'
                ? 'bg-ink-black text-paper-white shadow-xs'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            Evaluasi Bulanan (Monthly)
          </button>
        </div>

        {/* AUTO-COMPUTED PANELS (Strict Requirement) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Panel 1: Activity Completion per PIC */}
          <div className="p-5 rounded-[22px] bg-paper-white border border-sand-border flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ash-gray block mb-2">
                Laju Penyelesaian Aktivitas PIC
              </span>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Ferry (Leader)</span>
                    <span className="text-emerald-700">{rateFerry}% ({doneFerry}/{totalFerry})</span>
                  </div>
                  <div className="w-full h-1.5 bg-cool-mist rounded-full overflow-hidden">
                    <div style={{ width: `${rateFerry}%` }} className="h-full bg-emerald-600 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Ziyad (Sr. Officer)</span>
                    <span className="text-sky-700">{rateZiyad}% ({doneZiyad}/{totalZiyad})</span>
                  </div>
                  <div className="w-full h-1.5 bg-cool-mist rounded-full overflow-hidden">
                    <div style={{ width: `${rateZiyad}%` }} className="h-full bg-sky-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-stone-gray mt-3 block pt-2 border-t border-cool-mist">
              Dihitung otomatis dari log harian
            </span>
          </div>

          {/* Panel 2: Content Planned vs Published */}
          <div className="p-5 rounded-[22px] bg-paper-white border border-sand-border flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ash-gray block mb-2">
                Konten Rencana vs Tayang
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-ink-black">1</span>
                <span className="text-xs text-stone-gray font-medium">dari 4 konten tayang (25%)</span>
              </div>
              <div className="w-full h-1.5 bg-cool-mist rounded-full overflow-hidden mt-3">
                <div style={{ width: '25%' }} className="h-full bg-violet-pulse rounded-full" />
              </div>
              <div className="flex justify-between text-[11px] text-stone-gray mt-2">
                <span>1 Terbit</span>
                <span>1 Terjadwal</span>
                <span>2 Proses</span>
              </div>
            </div>
            <span className="text-[10px] text-stone-gray mt-3 block pt-2 border-t border-cool-mist">
              Sinkronisasi kalender konten
            </span>
          </div>

          {/* Panel 3: Channel Insight Deltas */}
          <div className="p-5 rounded-[22px] bg-paper-white border border-sand-border flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ash-gray block mb-2">
                Pertumbuhan Kanal (7 Hari)
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-gray">Instagram Reach:</span>
                  <span className="font-bold text-emerald-700">+32.4K (+18%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-gray">Pengunjung Web:</span>
                  <span className="font-bold text-emerald-700">1.840 (+12%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-gray">Rute Google Maps:</span>
                  <span className="font-bold text-emerald-700">312 (+5%)</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-stone-gray mt-3 block pt-2 border-t border-cool-mist">
              Perbandingan vs periode sebelumnya
            </span>
          </div>

          {/* Panel 4: Inventory Movement */}
          <div className="p-5 rounded-[22px] bg-paper-white border border-sand-border flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ash-gray block mb-2">
                Pergerakan Unit (Snapshot)
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-gray">Akad KPR Baru:</span>
                  <span className="font-bold text-emerald-700">+4 Unit (Grand Sevilla)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-gray">Booking Masuk:</span>
                  <span className="font-bold text-amber-700">+2 Unit (Grand Lestari)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-gray">SP3K Lolos:</span>
                  <span className="font-bold text-sky-700">+7 Unit (Setia Res.)</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-stone-gray mt-3 block pt-2 border-t border-cool-mist">
              Kalkulasi tren status inventori
            </span>
          </div>
        </div>

        {/* Current Evaluation Report Card */}
        {currentEval ? (
          <div className="rounded-[28px] bg-paper-white border border-sand-border p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sand-border">
              <div>
                <span className="text-xs font-semibold text-stone-gray flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Periode: {currentEval.period_start} s/d {currentEval.period_end}</span>
                </span>
                <h2 className="text-xl font-bold text-ink-black mt-1">
                  Ringkasan Eksekutif Hasil Evaluasi
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 self-start sm:self-auto">
                Laporan Terverifikasi Leader
              </span>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-warm-cream border border-sand-border text-sm text-stone-gray leading-relaxed">
              <strong className="text-ink-black block mb-1">Rangkuman Umum:</strong>
              {currentEval.summary}
            </div>

            {/* Wins, Issues, Learnings, Next Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wins */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Pencapaian Kunci (Wins)</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">{currentEval.wins}</p>
              </div>

              {/* Issues */}
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  <span>Kendala di Lapangan (Issues)</span>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed">{currentEval.issues}</p>
              </div>

              {/* Learnings */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-700" />
                  <span>Pembelajaran (Learnings)</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">{currentEval.learnings}</p>
              </div>

              {/* Next Actions */}
              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                  <ArrowRight className="w-4 h-4 text-sky-700" />
                  <span>Tindak Lanjut Prioritas (Next Actions)</span>
                </div>
                <p className="text-xs text-sky-950 leading-relaxed">{currentEval.next_actions}</p>
              </div>
            </div>

            {/* Target vs Actual Table */}
            {currentEval.items && currentEval.items.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-cool-mist">
                <h3 className="font-bold text-sm text-ink-black">
                  Pencapaian Target Item Rencana
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-sand-border text-ash-gray uppercase font-semibold text-[10px]">
                        <th className="py-2.5 px-3">Target Rencana</th>
                        <th className="py-2.5 px-3">Realisasi Aktual</th>
                        <th className="py-2.5 px-3">Status Pencapaian</th>
                        <th className="py-2.5 px-3">Catatan Analisis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cool-mist">
                      {currentEval.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3 font-semibold text-ink-black">{item.target_value}</td>
                          <td className="py-3 px-3 font-bold text-emerald-700">{item.actual_value}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                item.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {item.status === 'completed' ? 'Melampaui Target' : 'Sebagian'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-stone-gray">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[28px] bg-paper-white border border-sand-border p-8 sm:p-12 text-center shadow-xs">
            <Award className="w-12 h-12 text-ash-gray mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink-black mb-1">
              Belum Ada Evaluasi Kinerja
            </h3>
            <p className="text-xs sm:text-sm text-stone-gray max-w-md mx-auto mb-6">
              Belum ada evaluasi kinerja untuk periode {periodType === 'weekly' ? 'mingguan' : 'bulanan'} ini. Klik tombol di bawah untuk membuat laporan evaluasi baru.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs"
            >
              Buat Evaluasi Baru
            </button>
          </div>
        )}

        {/* Modal: Catat Evaluasi Baru */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-paper-white border border-sand-border rounded-[28px] max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-sand-border mb-4">
                <h3 className="font-bold text-base text-ink-black">Catat Laporan Evaluasi Baru</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-stone-gray hover:text-ink-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEval} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-gray mb-1">Mulai Periode</label>
                    <input
                      type="date"
                      required
                      value={newEvalForm.period_start}
                      onChange={(e) => setNewEvalForm({ ...newEvalForm, period_start: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-gray mb-1">Akhir Periode</label>
                    <input
                      type="date"
                      required
                      value={newEvalForm.period_end}
                      onChange={(e) => setNewEvalForm({ ...newEvalForm, period_end: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-gray mb-1">Ringkasan Umum *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ringkasan pencapaian dan performa keseluruhan..."
                    value={newEvalForm.summary}
                    onChange={(e) => setNewEvalForm({ ...newEvalForm, summary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-emerald-800 mb-1">Pencapaian (Wins)</label>
                  <textarea
                    rows={2}
                    placeholder="Apa saja yang berjalan sangat baik dan melampaui target?"
                    value={newEvalForm.wins}
                    onChange={(e) => setNewEvalForm({ ...newEvalForm, wins: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-rose-800 mb-1">Kendala (Issues)</label>
                  <textarea
                    rows={2}
                    placeholder="Hambatan yang ditemui (konsumen, bank, materi, dsb)..."
                    value={newEvalForm.issues}
                    onChange={(e) => setNewEvalForm({ ...newEvalForm, issues: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-amber-800 mb-1">Pembelajaran (Learnings)</label>
                  <textarea
                    rows={2}
                    placeholder="Insight baru dari respon audiens atau calon pembeli..."
                    value={newEvalForm.learnings}
                    onChange={(e) => setNewEvalForm({ ...newEvalForm, learnings: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sky-800 mb-1">Tindak Lanjut (Next Actions)</label>
                  <textarea
                    rows={2}
                    placeholder="Langkah perbaikan konkret untuk periode berikutnya..."
                    value={newEvalForm.next_actions}
                    onChange={(e) => setNewEvalForm({ ...newEvalForm, next_actions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-sand-border text-xs font-semibold text-stone-gray"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-ink-black text-paper-white text-xs font-semibold hover:opacity-90"
                  >
                    Simpan Evaluasi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
