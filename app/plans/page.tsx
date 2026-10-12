'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { INITIAL_MARKETING_PLANS } from '@/lib/data/seed-plans-content';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import { MarketingPlan, PlanItem, PlanStatus } from '@/lib/types/database';
import {
  Target,
  PlusCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

export default function MarketingPlansPage() {
  const [plans, setPlans] = useState<(MarketingPlan & { items: PlanItem[] })[]>(
    INITIAL_MARKETING_PLANS
  );
  const [periodFilter, setPeriodFilter] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(plans[0]?.id || null);

  // New Plan Modal State
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    title: '',
    objective: '',
    period_type: 'weekly' as 'weekly' | 'monthly',
    period_start: '2026-10-19',
    period_end: '2026-10-25',
    status: 'draft' as PlanStatus,
  });

  // New Item Modal State
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [activePlanForNewItem, setActivePlanForNewItem] = useState<string | null>(null);
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    description: '',
    project_id: INITIAL_PROJECTS[0].id,
    pic_id: INITIAL_PROFILES[1].id,
    scope: 'online' as 'online' | 'offline',
    target_metric: 'reach',
    target_value: '10000',
    due_date: '2026-10-22',
  });

  const filteredPlans = plans.filter((p) => {
    if (periodFilter === 'all') return true;
    return p.period_type === periodFilter;
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: MarketingPlan & { items: PlanItem[] } = {
      id: `mp-${Date.now()}`,
      title: newPlanForm.title,
      objective: newPlanForm.objective,
      period_type: newPlanForm.period_type,
      period_start: newPlanForm.period_start,
      period_end: newPlanForm.period_end,
      status: newPlanForm.status,
      created_by: INITIAL_PROFILES[0].id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: INITIAL_PROFILES[0],
      items: [],
    };
    setPlans([newPlan, ...plans]);
    setIsNewPlanOpen(false);
    setExpandedPlanId(newPlan.id);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanForNewItem) return;

    const pic = INITIAL_PROFILES.find((p) => p.id === newItemForm.pic_id);
    const proj = INITIAL_PROJECTS.find((p) => p.id === newItemForm.project_id);

    const newItem: PlanItem = {
      id: `pi-${Date.now()}`,
      plan_id: activePlanForNewItem,
      title: newItemForm.title,
      description: newItemForm.description,
      project_id: newItemForm.project_id,
      pic_id: newItemForm.pic_id,
      scope: newItemForm.scope,
      target_metric: newItemForm.target_metric,
      target_value: newItemForm.target_value,
      due_date: newItemForm.due_date,
      status: 'planned',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pic,
      project: proj,
    };

    setPlans(
      plans.map((p) => (p.id === activePlanForNewItem ? { ...p, items: [...p.items, newItem] } : p))
    );
    setIsNewItemOpen(false);
  };

  const handleUpdateItemStatus = (planId: string, itemId: string, status: 'planned' | 'in_progress' | 'done') => {
    setPlans(
      plans.map((p) => {
        if (p.id !== planId) return p;
        return {
          ...p,
          items: p.items.map((i) => (i.id === itemId ? { ...i, status } : i)),
        };
      })
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warm-cream border border-sand-border text-xs text-stone-gray font-medium mb-1.5">
              <Target className="w-3.5 h-3.5 text-ink-black" />
              <span>Perencanaan Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
              Rencana Marketing (Online & Offline)
            </h1>
            <p className="text-sm text-stone-gray">
              Rumuskan strategi mingguan & bulanan, alokasi tugas PIC, dan pantau progres pencapaian KPI.
            </p>
          </div>

          <button
            onClick={() => setIsNewPlanOpen(true)}
            className="btn-pill-primary text-xs sm:text-sm inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Buat Rencana Baru</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-warm-cream border border-sand-border rounded-full w-fit">
          <button
            onClick={() => setPeriodFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              periodFilter === 'all'
                ? 'bg-ink-black text-paper-white shadow-xs'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            Semua Periode ({plans.length})
          </button>
          <button
            onClick={() => setPeriodFilter('weekly')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              periodFilter === 'weekly'
                ? 'bg-ink-black text-paper-white shadow-xs'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            Mingguan ({plans.filter((p) => p.period_type === 'weekly').length})
          </button>
          <button
            onClick={() => setPeriodFilter('monthly')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              periodFilter === 'monthly'
                ? 'bg-ink-black text-paper-white shadow-xs'
                : 'text-stone-gray hover:text-ink-black'
            }`}
          >
            Bulanan ({plans.filter((p) => p.period_type === 'monthly').length})
          </button>
        </div>

        {/* Plans List */}
        {filteredPlans.length === 0 ? (
          <div className="rounded-[28px] bg-paper-white border border-sand-border p-8 sm:p-12 text-center shadow-xs">
            <Target className="w-12 h-12 text-ash-gray mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink-black mb-1">
              Belum Ada Rencana Marketing
            </h3>
            <p className="text-xs sm:text-sm text-stone-gray max-w-md mx-auto mb-6">
              Belum ada rencana marketing aktif untuk periode ini. Klik tombol di bawah untuk menyusun target mingguan atau bulanan baru.
            </p>
            <button
              onClick={() => setIsNewPlanOpen(true)}
              className="btn-pill-primary text-xs"
            >
              Buat Rencana Baru
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            const completedCount = plan.items.filter((i) => i.status === 'done').length;
            const progress = plan.items.length
              ? Math.round((completedCount / plan.items.length) * 100)
              : 0;

            return (
              <div
                key={plan.id}
                className="rounded-[24px] bg-paper-white border border-sand-border overflow-hidden transition-all"
              >
                {/* Plan Header Bar */}
                <div
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-warm-cream/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sand-border"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          plan.period_type === 'weekly'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}
                      >
                        {plan.period_type === 'weekly' ? 'Rencana Mingguan' : 'Rencana Bulanan'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          plan.status === 'active'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : plan.status === 'completed'
                            ? 'bg-cool-mist text-ink-black'
                            : 'bg-warm-cream text-stone-gray'
                        }`}
                      >
                        {plan.status === 'active'
                          ? 'Aktif Berjalan'
                          : plan.status === 'completed'
                          ? 'Selesai'
                          : 'Draft'}
                      </span>
                      <span className="text-xs text-stone-gray font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {plan.period_start} s/d {plan.period_end}
                        </span>
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-ink-black">{plan.title}</h2>
                    {plan.objective && (
                      <p className="text-xs text-stone-gray leading-relaxed max-w-3xl">
                        {plan.objective}
                      </p>
                    )}
                  </div>

                  {/* Progress & Toggle */}
                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-stone-gray uppercase block font-semibold">
                        Progress Eksekusi
                      </span>
                      <span className="text-sm font-bold text-ink-black">
                        {completedCount}/{plan.items.length} Selesai ({progress}%)
                      </span>
                      <div className="w-24 h-1.5 bg-cool-mist rounded-full overflow-hidden mt-1">
                        <div
                          style={{ width: `${progress}%` }}
                          className="h-full bg-emerald-600 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="p-1 rounded-full border border-sand-border text-stone-gray">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Items Section */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-warm-cream/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-ink-black flex items-center gap-1.5">
                        <span>Rincian Item Pekerjaan ({plan.items.length})</span>
                      </h3>
                      <button
                        onClick={() => {
                          setActivePlanForNewItem(plan.id);
                          setIsNewItemOpen(true);
                        }}
                        className="px-3 py-1 rounded-full bg-ink-black text-paper-white text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ Tambah Item Tugas</span>
                      </button>
                    </div>

                    {plan.items.length === 0 ? (
                      <div className="p-8 text-center text-xs text-stone-gray bg-paper-white rounded-2xl border border-sand-border">
                        Belum ada item tugas dalam rencana ini. Klik tombol di atas untuk menambahkan.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {plan.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-paper-white border border-sand-border space-y-2.5 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1 text-[10px]">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    item.scope === 'online'
                                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {item.scope === 'online' ? '🌐 Online' : '📍 Offline Lapangan'}
                                </span>
                                {item.project && (
                                  <span className="text-stone-gray font-medium truncate max-w-[120px]">
                                    {item.project.name}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bold text-sm text-ink-black leading-snug">
                                {item.title}
                              </h4>
                              {item.description && (
                                <p className="text-xs text-stone-gray line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-cool-mist text-xs">
                              <div className="flex justify-between items-center text-stone-gray">
                                <span>Target:</span>
                                <span className="font-bold text-ink-black">
                                  {item.target_value} ({item.target_metric})
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-stone-gray">
                                <span>PIC:</span>
                                <span className="font-semibold text-ink-black">{item.pic?.full_name}</span>
                              </div>
                              <div className="flex justify-between items-center text-stone-gray">
                                <span>Batas Waktu:</span>
                                <span className="font-medium text-stone-gray">{item.due_date}</span>
                              </div>

                              {/* Status Dropdown */}
                              <div className="pt-1">
                                <select
                                  value={item.status}
                                  onChange={(e) =>
                                    handleUpdateItemStatus(
                                      plan.id,
                                      item.id,
                                      e.target.value as 'planned' | 'in_progress' | 'done'
                                    )
                                  }
                                  className={`w-full py-1 px-2 rounded-lg border text-xs font-semibold focus:outline-none ${
                                    item.status === 'done'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : item.status === 'in_progress'
                                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                                      : 'bg-warm-cream text-stone-gray border-sand-border'
                                  }`}
                                >
                                  <option value="planned">Direncanakan</option>
                                  <option value="in_progress">Sedang Berjalan</option>
                                  <option value="done">Selesai</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

        {/* Modal: Buat Rencana Baru */}
        {isNewPlanOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-paper-white border border-sand-border rounded-[28px] max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-sand-border mb-4">
                <h3 className="font-bold text-base text-ink-black">Buat Rencana Marketing Baru</h3>
                <button
                  onClick={() => setIsNewPlanOpen(false)}
                  className="p-1 rounded-full text-stone-gray hover:text-ink-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-gray uppercase mb-1">
                    Judul Rencana / Tema Kampanye *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pameran Properti Plaza Medan Fair & Promo KPR"
                    value={newPlanForm.title}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-cool-mist text-sm font-medium focus:outline-none focus:border-ink-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-gray mb-1">
                    Tujuan Utama (Objective)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Deskripsikan target closing, kunjungan, atau kesadaran merek..."
                    value={newPlanForm.objective}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, objective: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Tipe Periode
                    </label>
                    <select
                      value={newPlanForm.period_type}
                      onChange={(e) =>
                        setNewPlanForm({
                          ...newPlanForm,
                          period_type: e.target.value as 'weekly' | 'monthly',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold"
                    >
                      <option value="weekly">Mingguan (Weekly)</option>
                      <option value="monthly">Bulanan (Monthly)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">Status</label>
                    <select
                      value={newPlanForm.status}
                      onChange={(e) =>
                        setNewPlanForm({ ...newPlanForm, status: e.target.value as PlanStatus })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Aktif</option>
                      <option value="completed">Selesai</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Mulai Periode
                    </label>
                    <input
                      type="date"
                      required
                      value={newPlanForm.period_start}
                      onChange={(e) =>
                        setNewPlanForm({ ...newPlanForm, period_start: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Selesai Periode
                    </label>
                    <input
                      type="date"
                      required
                      value={newPlanForm.period_end}
                      onChange={(e) =>
                        setNewPlanForm({ ...newPlanForm, period_end: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPlanOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-sand-border text-xs font-semibold text-stone-gray"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-ink-black text-paper-white text-xs font-semibold hover:opacity-90"
                  >
                    Simpan Rencana
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Tambah Item Tugas */}
        {isNewItemOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-paper-white border border-sand-border rounded-[28px] max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-sand-border mb-4">
                <h3 className="font-bold text-base text-ink-black">Tambah Item Pekerjaan Rencana</h3>
                <button
                  onClick={() => setIsNewItemOpen(false)}
                  className="p-1 rounded-full text-stone-gray hover:text-ink-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-gray uppercase mb-1">
                    Nama Pekerjaan / Item *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Cetak 1.000 Flyer & Distribusi Pintu Masuk Bandara"
                    value={newItemForm.title}
                    onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-cool-mist text-sm font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Ruang Lingkup (Scope)
                    </label>
                    <select
                      value={newItemForm.scope}
                      onChange={(e) =>
                        setNewItemForm({
                          ...newItemForm,
                          scope: e.target.value as 'online' | 'offline',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold"
                    >
                      <option value="online">🌐 Online Marketing</option>
                      <option value="offline">📍 Offline / Lapangan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      PIC Pelaksana *
                    </label>
                    <select
                      value={newItemForm.pic_id}
                      onChange={(e) => setNewItemForm({ ...newItemForm, pic_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold"
                    >
                      <option value={INITIAL_PROFILES[0].id}>Ferry (Leader)</option>
                      <option value={INITIAL_PROFILES[1].id}>Ziyad (Sr. Branding)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Proyek Terkait
                    </label>
                    <select
                      value={newItemForm.project_id}
                      onChange={(e) =>
                        setNewItemForm({ ...newItemForm, project_id: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold"
                    >
                      {INITIAL_PROJECTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Target Metrik
                    </label>
                    <input
                      type="text"
                      placeholder="leads, reach, booking, dll."
                      value={newItemForm.target_metric}
                      onChange={(e) =>
                        setNewItemForm({ ...newItemForm, target_metric: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Nilai Target
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 25 booking / 50.000 reach"
                      value={newItemForm.target_value}
                      onChange={(e) =>
                        setNewItemForm({ ...newItemForm, target_value: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Tenggat Waktu
                    </label>
                    <input
                      type="date"
                      required
                      value={newItemForm.due_date}
                      onChange={(e) => setNewItemForm({ ...newItemForm, due_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewItemOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-sand-border text-xs font-semibold text-stone-gray"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-ink-black text-paper-white text-xs font-semibold hover:opacity-90"
                  >
                    Tambahkan ke Rencana
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
