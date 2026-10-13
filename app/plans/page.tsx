'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { INITIAL_MARKETING_PLANS } from '@/lib/data/seed-plans-content';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import { usePersistentState, STORAGE_KEYS } from '@/lib/storage/persistence';
import { MarketingPlan, PlanItem, PlanStatus } from '@/lib/types/database';
import {
  Target,
  Plus,
  Calendar,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
} from 'lucide-react';

export default function MarketingPlansPage() {
  const [plans, setPlans] = usePersistentState<(MarketingPlan & { items: PlanItem[] })[]>(
    STORAGE_KEYS.MARKETING_PLANS,
    INITIAL_MARKETING_PLANS
  );
  const [periodFilter, setPeriodFilter] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(
    plans[0]?.id || null
  );

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
  const [activePlanForNewItem, setActivePlanForNewItem] = useState<string | null>(
    null
  );
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
    setNewPlanForm({
      title: '',
      objective: '',
      period_type: 'weekly',
      period_start: '2026-10-19',
      period_end: '2026-10-25',
      status: 'draft',
    });
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
      plans.map((p) =>
        p.id === activePlanForNewItem
          ? { ...p, items: [...p.items, newItem] }
          : p
      )
    );
    setIsNewItemOpen(false);
    setNewItemForm({
      title: '',
      description: '',
      project_id: INITIAL_PROJECTS[0].id,
      pic_id: INITIAL_PROFILES[1].id,
      scope: 'online',
      target_metric: 'reach',
      target_value: '10000',
      due_date: '2026-10-22',
    });
  };

  const handleUpdateItemStatus = (
    planId: string,
    itemId: string,
    status: 'planned' | 'in_progress' | 'done'
  ) => {
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
        <PageHeader
          section="Perencanaan & KPI"
          meta={<span className="metric-mono">{plans.length} Rencana Terdaftar</span>}
          title="Rencana Marketing Terpadu"
          description="Susun target mingguan dan bulanan untuk kanal digital maupun aktivasi lapangan, alokasikan PIC, dan pantau realisasi KPI."
          actions={
            <button
              type="button"
              onClick={() => setIsNewPlanOpen(true)}
              className="btn-pill-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Rencana Baru</span>
            </button>
          }
        />

        {/* Period Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-warm-cream border border-sand-border">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPeriodFilter('all')}
              className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                periodFilter === 'all'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black hover:bg-paper-white'
              }`}
            >
              Semua Periode ({plans.length})
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('weekly')}
              className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                periodFilter === 'weekly'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black hover:bg-paper-white'
              }`}
            >
              Mingguan ({plans.filter((p) => p.period_type === 'weekly').length})
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('monthly')}
              className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                periodFilter === 'monthly'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black hover:bg-paper-white'
              }`}
            >
              Bulanan ({plans.filter((p) => p.period_type === 'monthly').length})
            </button>
          </div>
        </div>

        {/* Plans List */}
        {filteredPlans.length === 0 ? (
          <div className="card-clay p-12 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-warm-cream border border-sand-border flex items-center justify-center mx-auto text-stone-gray">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-ink-black">
              Belum Ada Rencana Marketing
            </h2>
            <p className="text-xs text-stone-gray max-w-md mx-auto leading-relaxed">
              Mulai susun rencana mingguan atau bulanan beserta rincian indikator kinerja utama (KPI) untuk tim pemasaran.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsNewPlanOpen(true)}
                className="btn-pill-primary"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Rencana Pertama</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlans.map((plan) => {
              const isExpanded = expandedPlanId === plan.id;
              const completedCount = plan.items.filter(
                (i) => i.status === 'done'
              ).length;
              const progress = plan.items.length
                ? Math.round((completedCount / plan.items.length) * 100)
                : 0;

              return (
                <section
                  key={plan.id}
                  className="card-clay p-0 overflow-hidden"
                >
                  {/* Accordion Header */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedPlanId(isExpanded ? null : plan.id)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedPlanId(isExpanded ? null : plan.id);
                      }
                    }}
                    className="p-5 sm:p-6 cursor-pointer hover:bg-warm-cream/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-[0.04em] bg-warm-cream border border-sand-border text-ink-black">
                          {plan.period_type === 'weekly'
                            ? 'Rencana Mingguan'
                            : 'Rencana Bulanan'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-[0.04em] border ${
                            plan.status === 'active'
                              ? 'bg-forest-surface text-forest border-forest-border'
                              : plan.status === 'completed'
                              ? 'bg-ink-black text-paper-white border-ink-black'
                              : 'bg-warm-cream text-stone-gray border-sand-border'
                          }`}
                        >
                          {plan.status === 'active'
                            ? 'Aktif Berjalan'
                            : plan.status === 'completed'
                            ? 'Selesai'
                            : 'Draft'}
                        </span>
                        <span className="metric-mono text-xs text-stone-gray inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-ash-gray" />
                          <span>
                            {plan.period_start} s/d {plan.period_end}
                          </span>
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-ink-black">
                        {plan.title}
                      </h2>
                      {plan.objective && (
                        <p className="text-xs text-stone-gray leading-relaxed max-w-3xl">
                          {plan.objective}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-ash-gray uppercase block font-semibold">
                          Realisasi Tugas
                        </span>
                        <span className="metric-mono text-sm font-bold text-ink-black">
                          {completedCount}/{plan.items.length} ({progress}%)
                        </span>
                        <div className="w-28 h-2 bg-warm-cream border border-sand-border rounded-full overflow-hidden mt-1">
                          <div
                            style={{ width: `${progress}%` }}
                            className="h-full bg-ink-black rounded-full"
                          />
                        </div>
                      </div>

                      <div className="w-9 h-9 rounded-full border border-sand-border bg-paper-white flex items-center justify-center text-stone-gray">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded KPI Execution Table (Zero Card-in-Card Nesting per R-11) */}
                  {isExpanded && (
                    <div className="border-t border-sand-border bg-paper-white">
                      <div className="px-6 py-3.5 bg-warm-cream border-b border-sand-border flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-xs uppercase tracking-[0.05em] text-stone-gray">
                          Matriks Item Pekerjaan & Target KPI ({plan.items.length})
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setActivePlanForNewItem(plan.id);
                            setIsNewItemOpen(true);
                          }}
                          className="btn-pill-primary text-xs py-1.5 px-3.5 min-h-9"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Item KPI</span>
                        </button>
                      </div>

                      {plan.items.length === 0 ? (
                        <div className="p-8 text-center text-xs text-stone-gray">
                          Belum ada item KPI di dalam rencana ini. Gunakan tombol Tambah Item KPI di kanan atas untuk memulai.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-sand-border bg-warm-cream/40 text-[11px] font-semibold uppercase tracking-[0.05em] text-ash-gray">
                                <th className="py-3 px-6">Item Pekerjaan</th>
                                <th className="py-3 px-4">Lingkup</th>
                                <th className="py-3 px-4">Proyek</th>
                                <th className="py-3 px-4">PIC</th>
                                <th className="py-3 px-4">Target KPI</th>
                                <th className="py-3 px-4">Tenggat</th>
                                <th className="py-3 px-6 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-sand-border">
                              {plan.items.map((item) => (
                                <tr
                                  key={item.id}
                                  className="hover:bg-warm-cream/40 transition-colors"
                                >
                                  <td className="py-3.5 px-6">
                                    <span className="font-bold text-ink-black block">
                                      {item.title}
                                    </span>
                                    {item.description && (
                                      <span className="text-[11px] text-stone-gray block mt-0.5">
                                        {item.description}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-warm-cream border border-sand-border text-ink-black">
                                      {item.scope === 'online' ? (
                                        <>
                                          <Globe className="w-3 h-3 text-violet-pulse" />
                                          <span>Online</span>
                                        </>
                                      ) : (
                                        <>
                                          <MapPin className="w-3 h-3 text-ember-orange" />
                                          <span>Lapangan</span>
                                        </>
                                      )}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-stone-gray font-medium">
                                    {item.project?.name || 'Korporat'}
                                  </td>
                                  <td className="py-3.5 px-4 font-semibold text-ink-black">
                                    {item.pic?.full_name}
                                  </td>
                                  <td className="py-3.5 px-4 metric-mono font-bold text-ink-black">
                                    {item.target_value}{' '}
                                    <span className="text-stone-gray font-normal">
                                      ({item.target_metric})
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 metric-mono text-stone-gray">
                                    {item.due_date}
                                  </td>
                                  <td className="py-3.5 px-6 text-right">
                                    <select
                                      aria-label={`Status ${item.title}`}
                                      value={item.status}
                                      onChange={(e) =>
                                        handleUpdateItemStatus(
                                          plan.id,
                                          item.id,
                                          e.target.value as
                                            | 'planned'
                                            | 'in_progress'
                                            | 'done'
                                        )
                                      }
                                      className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold ${
                                        item.status === 'done'
                                          ? 'bg-forest-surface text-forest border-forest-border'
                                          : item.status === 'in_progress'
                                          ? 'bg-paper-white text-violet-pulse border-violet-pulse/40'
                                          : 'bg-warm-cream text-stone-gray border-sand-border'
                                      }`}
                                    >
                                      <option value="planned">Direncanakan</option>
                                      <option value="in_progress">Berjalan</option>
                                      <option value="done">Selesai</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Modal: Buat Rencana Baru */}
        <Modal
          open={isNewPlanOpen}
          onClose={() => setIsNewPlanOpen(false)}
          title="Buat Rencana Marketing Baru"
          subtitle="Tetapkan tema kampanye, rentang periode, dan sasaran strategis."
        >
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Judul Rencana / Tema Kampanye *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kampanye KPR Subsidi & Aktivasi Lapangan Oktober"
                value={newPlanForm.title}
                onChange={(e) =>
                  setNewPlanForm({ ...newPlanForm, title: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Tujuan Utama (Objective)
              </label>
              <textarea
                rows={2}
                placeholder="Target perolehan prospek, booking unit, dan jangkauan digital..."
                value={newPlanForm.objective}
                onChange={(e) =>
                  setNewPlanForm({ ...newPlanForm, objective: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
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
                  className="input-clay text-xs font-semibold"
                >
                  <option value="weekly">Mingguan (Weekly)</option>
                  <option value="monthly">Bulanan (Monthly)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Status Rencana
                </label>
                <select
                  value={newPlanForm.status}
                  onChange={(e) =>
                    setNewPlanForm({
                      ...newPlanForm,
                      status: e.target.value as PlanStatus,
                    })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  required
                  value={newPlanForm.period_start}
                  onChange={(e) =>
                    setNewPlanForm({
                      ...newPlanForm,
                      period_start: e.target.value,
                    })
                  }
                  className="input-clay metric-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  required
                  value={newPlanForm.period_end}
                  onChange={(e) =>
                    setNewPlanForm({
                      ...newPlanForm,
                      period_end: e.target.value,
                    })
                  }
                  className="input-clay metric-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsNewPlanOpen(false)}
                className="btn-pill-ghost"
              >
                Batal
              </button>
              <button type="submit" className="btn-pill-primary">
                Simpan Rencana
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Tambah Item KPI */}
        <Modal
          open={isNewItemOpen}
          onClose={() => setIsNewItemOpen(false)}
          title="Tambah Item Pekerjaan & KPI"
          subtitle="Alokasikan target terukur kepada PIC pelaksana."
        >
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Nama Pekerjaan / Inisiatif *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Distribusi Brosur Kawasan Industri & Reels KPR"
                value={newItemForm.title}
                onChange={(e) =>
                  setNewItemForm({ ...newItemForm, title: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Ruang Lingkup
                </label>
                <select
                  value={newItemForm.scope}
                  onChange={(e) =>
                    setNewItemForm({
                      ...newItemForm,
                      scope: e.target.value as 'online' | 'offline',
                    })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  <option value="online">Online Marketing</option>
                  <option value="offline">Offline / Lapangan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  PIC Pelaksana *
                </label>
                <select
                  value={newItemForm.pic_id}
                  onChange={(e) =>
                    setNewItemForm({ ...newItemForm, pic_id: e.target.value })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  <option value={INITIAL_PROFILES[0].id}>Ferry (Leader)</option>
                  <option value={INITIAL_PROFILES[1].id}>
                    Ziyad (Sr. Branding)
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Proyek Terkait
                </label>
                <select
                  value={newItemForm.project_id}
                  onChange={(e) =>
                    setNewItemForm({
                      ...newItemForm,
                      project_id: e.target.value,
                    })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Satuan Metrik KPI
                </label>
                <input
                  type="text"
                  placeholder="reach, leads, booking, dll."
                  value={newItemForm.target_metric}
                  onChange={(e) =>
                    setNewItemForm({
                      ...newItemForm,
                      target_metric: e.target.value,
                    })
                  }
                  className="input-clay"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Angka Target KPI
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 25 atau 50.000"
                  value={newItemForm.target_value}
                  onChange={(e) =>
                    setNewItemForm({
                      ...newItemForm,
                      target_value: e.target.value,
                    })
                  }
                  className="input-clay metric-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Tenggat Waktu
                </label>
                <input
                  type="date"
                  required
                  value={newItemForm.due_date}
                  onChange={(e) =>
                    setNewItemForm({ ...newItemForm, due_date: e.target.value })
                  }
                  className="input-clay metric-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsNewItemOpen(false)}
                className="btn-pill-ghost"
              >
                Batal
              </button>
              <button type="submit" className="btn-pill-primary">
                Tambahkan ke Rencana
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
