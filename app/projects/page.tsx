'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import {
  INITIAL_PROJECTS,
  INITIAL_UNIT_SNAPSHOTS,
  INITIAL_KOS_SNAPSHOTS,
} from '@/lib/data/seed-data';
import { Project, UnitSnapshot, KosSnapshot } from '@/lib/types/database';
import { usePersistentState, STORAGE_KEYS } from '@/lib/storage/persistence';
import { QuickUnitSaleModal } from '@/components/modules/projects/quick-unit-sale-modal';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  MapPin,
  Table2,
  Plus,
  Tag,
} from 'lucide-react';
import { InstagramIcon } from '@/components/shared/icons';

export default function ProjectsPage() {
  const [filter, setFilter] = useState<'all' | 'active_project' | 'business_unit' | 'upcoming'>('all');
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [selectedModalProject, setSelectedModalProject] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenSaleModal = (projectId?: string) => {
    setSelectedModalProject(projectId);
    setIsUnitModalOpen(true);
  };

  const [allHousingSnapshots] = usePersistentState<Record<string, UnitSnapshot[]>>(
    STORAGE_KEYS.HOUSING_SNAPSHOTS,
    INITIAL_UNIT_SNAPSHOTS
  );
  const [allKosSnapshots] = usePersistentState<Record<string, KosSnapshot[]>>(
    STORAGE_KEYS.KOS_SNAPSHOTS,
    INITIAL_KOS_SNAPSHOTS
  );

  const counts = {
    all: INITIAL_PROJECTS.length,
    active_project: INITIAL_PROJECTS.filter((p) => p.kind === 'active_project').length,
    business_unit: INITIAL_PROJECTS.filter((p) => p.kind === 'business_unit').length,
    upcoming: INITIAL_PROJECTS.filter((p) => p.kind === 'upcoming').length,
  };

  const filteredProjects = INITIAL_PROJECTS.filter((p) => {
    if (filter === 'all') return true;
    return p.kind === filter;
  });

  const getHousingMetrics = (project: Project) => {
    const snapshots = allHousingSnapshots[project.id] || [];
    const latest = snapshots[0] as UnitSnapshot | undefined;
    if (!latest) return null;

    const allocated =
      latest.belum_terjual +
      latest.booking +
      latest.sp3k +
      latest.akad_kredit +
      latest.cash_keras +
      latest.hold_manajemen;

    const unallocated = project.total_units - allocated;
    const sold = latest.akad_kredit + latest.cash_keras;
    const pipeline = latest.booking + latest.sp3k;

    return {
      latest,
      allocated,
      unallocated,
      sold,
      pipeline,
      persenTerjual:
        project.total_units > 0
          ? Math.round((sold / project.total_units) * 100)
          : 0,
    };
  };

  const getKosMetrics = (project: Project) => {
    const snapshots = allKosSnapshots[project.id] || [];
    const latest = snapshots[0] as KosSnapshot | undefined;
    if (!latest) return null;

    const occupancyRate =
      project.total_units > 0
        ? Math.round((latest.terisi / project.total_units) * 100)
        : 0;
    return {
      latest,
      occupancyRate,
    };
  };

  // Separate projects requiring inventory reconciliation (e.g. Samudera Residence) so the regular grid never exceeds 6 cards (R-06)
  const attentionProjects = filteredProjects.filter((p) => {
    if (p.kind !== 'active_project') return false;
    const m = getHousingMetrics(p);
    return m && m.unallocated !== 0;
  });

  const standardProjects = filteredProjects.filter(
    (p) => !attentionProjects.some((ap) => ap.id === p.id)
  );

  return (
    <AppShell>
      <div className="space-y-7">
        {toastMessage && (
          <aside
            role="status"
            aria-live="polite"
            className="p-3.5 rounded-2xl bg-forest-surface border border-forest-border text-xs font-semibold text-ink-black flex items-center gap-2.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
            <span>{toastMessage}</span>
          </aside>
        )}
        <PageHeader
          section="Portofolio & Inventaris"
          meta={<span>{INITIAL_PROJECTS.length} Entitas Terdaftar</span>}
          title="Proyek & Rekonsiliasi Unit"
          description="Pantau posisi stok unit perumahan subsidi, progres KPR (Booking, SP3K, Akad), dan rekonsiliasi kapasitas master di Medan & Deli Serdang."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenSaleModal()}
                className="btn-pill-terracotta text-xs py-2 px-3.5 inline-flex items-center gap-1.5 shadow-2xs"
                title="Catat perubahan status unit (booking, SP3K, akad, cash) secara cepat"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Penjualan Unit</span>
              </button>

              <div className="inline-flex items-center p-1 rounded-full bg-warm-cream border border-sand-border">
                <button
                  type="button"
                  onClick={() => setDisplayMode('cards')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                    displayMode === 'cards'
                      ? 'bg-ink-black text-paper-white'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kartu Portofolio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('table')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                    displayMode === 'table'
                      ? 'bg-ink-black text-paper-white'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Tabel Rekonsiliasi</span>
                </button>
              </div>
            </div>
          }
        />

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-warm-cream border border-sand-border">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 min-h-10 rounded-full text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black hover:bg-paper-white'
              }`}
            >
              Semua Entitas ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active_project')}
              className={`px-3.5 py-2 min-h-10 rounded-full text-xs font-semibold transition-colors ${
                filter === 'active_project'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black hover:bg-paper-white'
              }`}
            >
              Perumahan Aktif ({counts.active_project})
            </button>
            {counts.business_unit > 0 && (
              <button
                type="button"
                onClick={() => setFilter('business_unit')}
                className={`px-3.5 py-2 min-h-10 rounded-full text-xs font-semibold transition-colors ${
                  filter === 'business_unit'
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black hover:bg-paper-white'
                }`}
              >
                Unit Korporat / Bisnis ({counts.business_unit})
              </button>
            )}
            {counts.upcoming > 0 && (
              <button
                type="button"
                onClick={() => setFilter('upcoming')}
                className={`px-3.5 py-2 min-h-10 rounded-full text-xs font-semibold transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black hover:bg-paper-white'
                }`}
              >
                Pengembangan Baru ({counts.upcoming})
              </button>
            )}
          </div>

          <span className="text-xs text-stone-gray px-2 font-medium">
            Menampilkan <strong className="metric-mono text-ink-black">{filteredProjects.length}</strong> entitas
          </span>
        </div>

        {/* Priority Reconciliation Callout Section (Samudera Residence Unallocated = 3) */}
        {attentionProjects.map((project) => {
          const metrics = getHousingMetrics(project);
          if (!metrics) return null;

          return (
            <section
              key={project.id}
              aria-label={`Rekonsiliasi Prioritas ${project.name}`}
              className="p-5 sm:p-6 rounded-2xl bg-ember-surface border border-ember-border flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-paper-white border border-ember-border text-ember-orange text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Perlu Rekonsiliasi Kapasitas Unit</span>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-xl font-bold text-ink-black">
                    {project.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-gray">
                    <MapPin className="w-3.5 h-3.5 text-ash-gray" />
                    <span>{project.location}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-gray leading-relaxed">
                  Kapasitas master proyek tercatat <strong className="metric-mono font-bold">{project.total_units} {project.unit_label}</strong>, sedangkan total unit yang teralokasi pada status snapshot saat ini adalah <strong className="metric-mono font-bold">{metrics.allocated} {project.unit_label}</strong>. Terdapat selisih <strong className="metric-mono font-bold text-ember-orange">{metrics.unallocated} {project.unit_label} (Unallocated)</strong> yang wajib diverifikasi.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <div className="grid grid-cols-3 gap-2 bg-paper-white p-2.5 rounded-xl border border-ember-border text-center min-w-[230px]">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-ash-gray block">
                      Master
                    </span>
                    <span className="metric-mono text-base font-bold text-ink-black">
                      {project.total_units}
                    </span>
                  </div>
                  <div className="border-x border-sand-border px-2">
                    <span className="text-[10px] font-semibold uppercase text-ash-gray block">
                      Teralokasi
                    </span>
                    <span className="metric-mono text-base font-bold text-ink-black">
                      {metrics.allocated}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-ember-orange block">
                      Selisih
                    </span>
                    <span className="metric-mono text-base font-bold text-ember-orange">
                      {metrics.unallocated}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/projects/${project.slug}`}
                  className="btn-pill-terracotta min-h-11 px-5 shrink-0 shadow-2xs"
                >
                  <span>Buka & Rekonsiliasi</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          );
        })}

        {/* Display Mode: Cards Grid (Strictly <= 6 Cards, <= 3 Data Points per Card) */}
        {displayMode === 'cards' ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {standardProjects.map((project) => {
              const isHousing = project.kind === 'active_project';
              const isKos = project.kind === 'business_unit';
              const housing = isHousing ? getHousingMetrics(project) : null;
              const kos = isKos ? getKosMetrics(project) : null;

              return (
                <article
                  key={project.id}
                  className="bento-card p-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Data Point 1: Identity & Location */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.05em] text-ash-gray mb-1">
                          {isHousing
                            ? 'Perumahan Subsidi'
                            : isKos
                            ? 'Entitas Korporat'
                            : 'Pengembangan Baru'}
                        </span>
                        <h2 className="text-lg font-bold text-ink-black truncate">
                          {project.name}
                        </h2>
                        <p className="text-xs text-stone-gray flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-ash-gray shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </p>
                      </div>

                      {project.instagram_handle && (
                        <a
                          href={`https://instagram.com/${project.instagram_handle}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Instagram ${project.name}`}
                          className="min-w-9 min-h-9 rounded-full bg-warm-cream border border-sand-border flex items-center justify-center text-stone-gray hover:text-ink-black hover:border-ink-black transition-colors shrink-0"
                        >
                          <InstagramIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Data Point 2: Primary Progress Bar & Realization Metric */}
                    {housing && housing.latest && (
                      <div className="p-3.5 rounded-xl bg-warm-cream border border-sand-border space-y-2.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-medium text-stone-gray">
                            Realisasi Terjual
                          </span>
                          <span className="metric-mono text-sm font-bold text-ink-black">
                            {housing.sold} / {project.total_units} unit ({housing.persenTerjual}%)
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-paper-white border border-sand-border overflow-hidden flex">
                          <div
                            style={{
                              width: `${Math.round((housing.sold / project.total_units) * 100)}%`,
                            }}
                            className="bg-ink-black h-full"
                          />
                          <div
                            style={{
                              width: `${Math.round((housing.pipeline / project.total_units) * 100)}%`,
                            }}
                            className="bg-violet-pulse h-full"
                          />
                        </div>

                        {/* Data Point 3: Compact Pipeline Summary Line */}
                        <div className="pt-1 flex items-center justify-between text-[11px] text-stone-gray metric-mono">
                          <span>Tersedia: {housing.latest.belum_terjual}</span>
                          <span>Proses KPR: {housing.pipeline}</span>
                          <span>Hold: {housing.latest.hold_manajemen}</span>
                        </div>
                      </div>
                    )}

                    {/* Corporate / Business Unit Card Body */}
                    {isKos && (
                      <div className="p-3.5 rounded-xl bg-warm-cream border border-sand-border space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-gray font-medium">Peran Entitas</span>
                          <span className="font-semibold text-ink-black">Holding & Brand Induk</span>
                        </div>
                        {kos && kos.latest ? (
                          <p className="text-xs text-stone-gray metric-mono">
                            Okupansi: {kos.latest.terisi} / {project.total_units} ({kos.occupancyRate}%)
                          </p>
                        ) : (
                          <p className="text-xs text-stone-gray">
                            Pusat komunikasi korporat, portal web utama, dan kanal resmi grup.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-sand-border flex items-center justify-between">
                    <span className="metric-mono text-xs font-semibold text-stone-gray">
                      Kapasitas: {project.total_units} {project.unit_label}
                    </span>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-black hover:text-violet-pulse transition-colors py-1"
                    >
                      <span>Rincian Funnel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          /* Display Mode: Full 7-Project Reconciliation Table */
          <section className="card-clay p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sand-border bg-warm-cream text-[11px] font-semibold uppercase tracking-[0.05em] text-ash-gray">
                    <th className="py-3.5 px-5">Nama Proyek</th>
                    <th className="py-3.5 px-4">Lokasi</th>
                    <th className="py-3.5 px-3 text-right">Master</th>
                    <th className="py-3.5 px-3 text-right">Tersedia</th>
                    <th className="py-3.5 px-3 text-right">Booking</th>
                    <th className="py-3.5 px-3 text-right">SP3K</th>
                    <th className="py-3.5 px-3 text-right">Akad</th>
                    <th className="py-3.5 px-3 text-right">Cash</th>
                    <th className="py-3.5 px-3 text-right">Hold</th>
                    <th className="py-3.5 px-4 text-right">Rekonsiliasi</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border text-xs">
                  {filteredProjects.map((project) => {
                    const housing =
                      project.kind === 'active_project'
                        ? getHousingMetrics(project)
                        : null;
                    const snap = housing?.latest;

                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-warm-cream/60 transition-colors"
                      >
                        <td className="py-3.5 px-5 font-bold text-ink-black">
                          {project.name}
                        </td>
                        <td className="py-3.5 px-4 text-stone-gray">
                          {project.location}
                        </td>
                        <td className="py-3.5 px-3 text-right metric-mono font-bold text-ink-black">
                          {project.total_units}
                        </td>
                        <td className="py-3.5 px-3 text-right metric-mono text-stone-gray">
                          {snap ? snap.belum_terjual : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-right metric-mono text-stone-gray">
                          {snap ? snap.booking : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-right metric-mono text-violet-pulse font-semibold">
                          {snap ? snap.sp3k : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-right metric-mono text-forest font-semibold">
                          {snap ? snap.akad_kredit : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-right metric-mono text-stone-gray">
                          {snap ? snap.cash_keras : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-right metric-mono text-stone-gray">
                          {snap ? snap.hold_manajemen : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {housing ? (
                            housing.unallocated !== 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-ember-surface text-ember-orange border border-ember-border metric-mono">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{housing.unallocated} Unallocated</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-forest-surface text-forest border border-forest-border">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Seimbang</span>
                              </span>
                            )
                          ) : (
                            <span className="text-ash-gray">Korporat</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="inline-flex items-center gap-1 font-semibold text-ink-black hover:text-violet-pulse"
                          >
                            <span>Detail</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <QuickUnitSaleModal
          isOpen={isUnitModalOpen}
          defaultProjectId={selectedModalProject}
          onClose={() => setIsUnitModalOpen(false)}
          onSuccess={showToast}
        />
      </div>
    </AppShell>
  );
}
