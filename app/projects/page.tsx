'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  INITIAL_PROJECTS,
  INITIAL_UNIT_SNAPSHOTS,
  INITIAL_KOS_SNAPSHOTS,
} from '@/lib/data/seed-data';
import { Project, UnitSnapshot, KosSnapshot } from '@/lib/types/database';
import {
  Building2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { InstagramIcon } from '@/components/shared/icons';

export default function ProjectsPage() {
  const [filter, setFilter] = useState<'all' | 'active_project' | 'business_unit' | 'upcoming'>('all');

  const filteredProjects = INITIAL_PROJECTS.filter((p) => {
    if (filter === 'all') return true;
    return p.kind === filter;
  });

  const getHousingMetrics = (project: Project) => {
    const snapshots = INITIAL_UNIT_SNAPSHOTS[project.id] || [];
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

    return {
      latest,
      allocated,
      unallocated,
      persenTerjual: Math.round(((latest.akad_kredit + latest.cash_keras) / project.total_units) * 100),
    };
  };

  const getKosMetrics = (project: Project) => {
    const snapshots = INITIAL_KOS_SNAPSHOTS[project.id] || [];
    const latest = snapshots[0] as KosSnapshot | undefined;
    if (!latest) return null;

    const occupancyRate = Math.round((latest.terisi / project.total_units) * 100);
    return {
      latest,
      occupancyRate,
    };
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warm-cream border border-sand-border text-xs text-stone-gray font-medium mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-ink-black" />
              <span>Inventori Real Estat Sedaya</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
              Proyek & Inventori Unit
            </h1>
            <p className="text-sm text-stone-gray">
              Kelola status funnel perumahan subsidi, okupansi kos, dan proyek mendatang di Deli Serdang & Medan.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-warm-cream border border-sand-border rounded-full self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              Semua ({INITIAL_PROJECTS.length})
            </button>
            <button
              onClick={() => setFilter('active_project')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filter === 'active_project'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              Perumahan Aktif (5)
            </button>
            <button
              onClick={() => setFilter('business_unit')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filter === 'business_unit'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              Unit Bisnis (1)
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filter === 'upcoming'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              Mendatang (2)
            </button>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isHousing = project.kind === 'active_project';
            const isKos = project.kind === 'business_unit';
            const isUpcoming = project.kind === 'upcoming';
            const housing = isHousing ? getHousingMetrics(project) : null;
            const kos = isKos ? getKosMetrics(project) : null;

            return (
              <div
                key={project.id}
                className="bg-paper-white border border-sand-border rounded-[24px] p-5 flex flex-col justify-between hover:border-ink-black transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                          isHousing
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isKos
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {isHousing
                          ? 'Perumahan Subsidi'
                          : isKos
                          ? 'Unit Bisnis (Kos)'
                          : 'Proyek Mendatang (2026/27)'}
                      </span>
                      <h2 className="text-lg font-bold text-ink-black group-hover:text-violet-pulse transition leading-snug">
                        {project.name}
                      </h2>
                      <p className="text-xs text-stone-gray font-medium flex items-center gap-1 mt-0.5">
                        <span>📍 {project.location}</span>
                        <span>•</span>
                        <span>{project.total_units} {project.unit_label}</span>
                      </p>
                    </div>

                    {project.instagram_handle && (
                      <a
                        href={`https://instagram.com/${project.instagram_handle}`}
                        target="_blank"
                        rel="noreferrer"
                        title={`@${project.instagram_handle}`}
                        className="p-1.5 rounded-full bg-warm-cream border border-sand-border text-stone-gray hover:text-pink-600 transition"
                      >
                        <InstagramIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Unallocated Warning Alert if not zero */}
                  {housing && housing.unallocated !== 0 && (
                    <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center gap-2 text-amber-900 text-xs font-semibold animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        Unallocated: {housing.unallocated} {project.unit_label} belum dialokasikan!
                      </span>
                    </div>
                  )}

                  {/* Housing Inventory Status Snapshot */}
                  {housing && housing.latest && (
                    <div className="space-y-3 my-3 pt-2 border-t border-cool-mist">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-gray font-medium">Realisasi (Akad + Cash):</span>
                        <span className="font-bold text-ink-black">
                          {housing.latest.akad_kredit + housing.latest.cash_keras} / {project.total_units} ({housing.persenTerjual}%)
                        </span>
                      </div>

                      {/* Mini Funnel Progress Bar */}
                      <div className="w-full h-2.5 rounded-full bg-cool-mist overflow-hidden flex">
                        <div
                          style={{
                            width: `${Math.round(((housing.latest.akad_kredit + housing.latest.cash_keras) / project.total_units) * 100)}%`,
                          }}
                          className="bg-emerald-600 h-full"
                          title="Akad & Cash"
                        />
                        <div
                          style={{
                            width: `${Math.round((housing.latest.sp3k / project.total_units) * 100)}%`,
                          }}
                          className="bg-sky-500 h-full"
                          title="SP3K"
                        />
                        <div
                          style={{
                            width: `${Math.round((housing.latest.booking / project.total_units) * 100)}%`,
                          }}
                          className="bg-amber-400 h-full"
                          title="Booking"
                        />
                        <div
                          style={{
                            width: `${Math.round((housing.latest.hold_manajemen / project.total_units) * 100)}%`,
                          }}
                          className="bg-rose-400 h-full"
                          title="Hold Manajemen"
                        />
                      </div>

                      {/* Status Badges Grid */}
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1">
                        <div className="p-1.5 rounded-lg bg-warm-cream border border-sand-border text-center">
                          <span className="text-ash-gray block text-[10px]">Tersedia</span>
                          <span className="font-bold text-ink-black">{housing.latest.belum_terjual}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-warm-cream border border-sand-border text-center">
                          <span className="text-ash-gray block text-[10px]">Booking</span>
                          <span className="font-bold text-ink-black">{housing.latest.booking}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-warm-cream border border-sand-border text-center">
                          <span className="text-ash-gray block text-[10px]">SP3K</span>
                          <span className="font-bold text-ink-black">{housing.latest.sp3k}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-emerald-900">
                          <span className="block text-[10px]">Akad Kredit</span>
                          <span className="font-bold">{housing.latest.akad_kredit}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-warm-cream border border-sand-border text-center">
                          <span className="text-ash-gray block text-[10px]">Cash Keras</span>
                          <span className="font-bold text-ink-black">{housing.latest.cash_keras}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-warm-cream border border-sand-border text-center">
                          <span className="text-ash-gray block text-[10px]">Hold</span>
                          <span className="font-bold text-ink-black">{housing.latest.hold_manajemen}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Kos Status Snapshot */}
                  {kos && kos.latest && (
                    <div className="space-y-3 my-3 pt-2 border-t border-cool-mist">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-gray font-medium">Tingkat Okupansi:</span>
                        <span className="font-bold text-emerald-700">{kos.occupancyRate}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-cool-mist overflow-hidden">
                        <div
                          style={{ width: `${kos.occupancyRate}%` }}
                          className="bg-emerald-600 h-full rounded-full"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                          <span className="text-emerald-700 block text-[10px]">Terisi</span>
                          <span className="font-bold text-emerald-900 text-sm">{kos.latest.terisi}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-warm-cream border border-sand-border text-center">
                          <span className="text-stone-gray block text-[10px]">Kosong</span>
                          <span className="font-bold text-ink-black text-sm">{kos.latest.belum_terisi}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                          <span className="text-amber-800 block text-[10px]">Hold/Book</span>
                          <span className="font-bold text-amber-900 text-sm">{kos.latest.booking_hold}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upcoming Project Details */}
                  {isUpcoming && (
                    <div className="p-3 my-3 rounded-2xl bg-warm-cream border border-sand-border text-xs space-y-2">
                      <p className="text-stone-gray">
                        Rencana pengembangan kawasan subsidi terpadu tahap lanjutan.
                      </p>
                      {project.breakdown && (
                        <div className="flex gap-2 pt-1 border-t border-sand-border">
                          <span className="px-2 py-0.5 rounded-md bg-paper-white border border-sand-border font-medium">
                            Ruko: {project.breakdown.ruko} unit
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-paper-white border border-sand-border font-medium">
                            Subsidi: {project.breakdown.rumah_subsidi} unit
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="pt-4 border-t border-cool-mist mt-2">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="w-full py-2.5 px-4 rounded-full bg-warm-cream hover:bg-ink-black text-ink-black hover:text-paper-white border border-sand-border font-medium text-xs flex items-center justify-between transition"
                  >
                    <span>Detail Funnel & Riwayat</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
